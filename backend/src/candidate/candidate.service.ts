import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CandidateDto } from './dto/candidate.dto';
import { CandidateEntity } from './entities/candidate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(CandidateEntity)
    private readonly repo: Repository<CandidateEntity>,
  ) {}

  /**
   * Fetches all persisted candidates ordered by most recent first.
   *
   * @returns Array of persisted candidates sorted by descending `id`.
   */
  async findAll(): Promise<CandidateEntity[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  /**
   * Parses the uploaded Excel file, normalizes fields, validates input,
   * persists the resulting candidate and returns the saved entity.
   *
   * The method supports files **with a header row** (e.g., "Seniority",
   * "Years of experience", "Availability") or **without a header**
   * (first row contains data). Column names are normalized with common
   * English/Spanish aliases.
   *
   * Steps:
   * 1. Read workbook/sheet from the uploaded buffer.
   * 2. Try object-mode parsing (header row). Fallback to row/array mode skipping header.
   * 3. Validate required fields (`seniority`, `years`, `availability`).
   * 4. Normalize values and coerce types.
   * 5. Persist and return the saved entity.
   *
   * @param body - Form fields containing `name` and `surname`.
   * @param file - Uploaded Excel file (`.xlsx`/`.xls`) under field name `file`.
   * @returns The persisted candidate entity.
   * @throws BadRequestException When file is missing, the sheet is empty,
   *         columns are missing/invalid, or values fail validation.
   */
  async processCandidate(
    body: CandidateDto,
    file: Express.Multer.File,
  ): Promise<CandidateEntity> {
    if (!file) throw new BadRequestException('File is required');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 1) Primary attempt: read as objects using first row as header
    type Row = Record<string, unknown>;
    const rowsObj: Row[] = XLSX.utils.sheet_to_json<Row>(worksheet, {
      header: 0,      
      defval: null,   
      blankrows: false,
      raw: true,
    });

    let seniorityRaw: unknown, yearsRaw: unknown, availabilityRaw: unknown;

    if (rowsObj.length > 0) {
      const normalized = rowsObj.map((r) => this.normalizeKeys(r));
      const first =
        normalized.find(
          (r) =>
            r.seniority !== undefined ||
            r.years !== undefined ||
            r.availability !== undefined,
        ) ?? normalized[0];

      seniorityRaw = first.seniority;
      yearsRaw = first.years;
      availabilityRaw = first.availability;
    } else {
      // 2) Fallback: read by rows and explicitly skip the header row
      const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        blankrows: false,
        raw: true,
        defval: null,
      });

      const row = (data as unknown[][])
        .slice(1)
        .find(
          (r) =>
            Array.isArray(r) &&
            r.filter((c) => c !== undefined && c !== null && String(c).trim() !== '')
              .length >= 3,
        );

      if (!row) {
        throw new BadRequestException('No candidate data found in excel (no data rows)');
      }
      [seniorityRaw, yearsRaw, availabilityRaw] = row as [unknown, unknown, unknown];
    }

    // Validation & normalization
    if (seniorityRaw === undefined || yearsRaw === undefined || availabilityRaw === undefined) {
      throw new BadRequestException(
        'Missing required columns: seniority, years of experience, availability',
      );
    }

    const seniority = String(seniorityRaw).trim().toLowerCase();
    if (!['junior', 'senior'].includes(seniority)) {
      throw new BadRequestException('Seniority must be "junior" or "senior"');
    }

    const years = this.toNumber(yearsRaw);
    if (!isFinite(years)) {
      throw new BadRequestException('Years of experience must be a number');
    }
    if (years < 0) {
      throw new BadRequestException('Years of experience cannot be negative');
    }

    const availability = this.coerceBoolean(availabilityRaw);

    // Persistence
    const entity = this.repo.create({
      name: body.name,
      surname: body.surname,
      seniority: seniority as 'junior' | 'senior',
      years,
      availability,
    });

    return await this.repo.save(entity);
  }

  /**
   * Maps various column label variants (EN/ES, with/without spaces, camel/snake)
   * to canonical keys: `{ seniority, years, availability }`.
   *
   * Examples of accepted aliases:
   * - Seniority: "seniority", "nivel", "categoria"
   * - Years: "yearsOfExperience", "years", "experienceYears", "años", "añosDeExperiencia", "aniosDeExperiencia"
   * - Availability: "availability", "disponible", "disponibilidad"
   *
   * @param row - A single parsed row object (header mode).
   * @returns Object with possibly present keys: `seniority`, `years`, `availability`.
   */
  private normalizeKeys(row: Record<string, unknown>): {
    seniority?: unknown;
    years?: unknown;
    availability?: unknown;
  } {
    const norm = (s: string) =>
      s?.toString().trim().toLowerCase().replace(/[\s._-]+/g, '');
    const map: Record<string, string> = {};
    for (const key of Object.keys(row)) {
      map[norm(key)] = key;
    }
    const pick = (...aliases: string[]) => {
      for (const a of aliases) {
        if (map[a] !== undefined) return row[map[a]];
      }
      return undefined;
    };

    return {
      seniority: pick('seniority', 'nivel', 'categoria'),
      years: pick(
        'yearsofexperience',
        'years',
        'experienceyears',
        'años',
        'añosdeexperiencia',
        'aniosdeexperiencia',
      ),
      availability: pick('availability', 'disponible', 'disponibilidad'),
    };
  }

  /**
   * Converts a string/number-like value to a number.
   * Accepts comma decimal separator (e.g. "2,5" -> 2.5).
   *
   * @param value - Input value to convert.
   * @returns Parsed number (NaN if not convertible).
   */
  private toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    const s = String(value ?? '').trim().replace(',', '.');
    return Number(s);
  }

  /**
   * Coerces common truthy/falsy representations to boolean.
   * Truthy: 'true','yes','1','si','sí','y','on' (case-insensitive).
   * Falsy:  'false','no','0','n','off' and empty string.
   *
   * @param value - Value to coerce.
   * @returns Boolean coercion result.
   * @throws BadRequestException When the value cannot be interpreted as boolean.
   */
  private coerceBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;

    const str = String(value ?? '').trim().toLowerCase();
    if (['true', 'yes', '1', 'si', 'sí', 'y', 'on'].includes(str)) return true;
    if (['false', 'no', '0', 'n', 'off'].includes(str)) return false;
    if (str === '') return false; 

    throw new BadRequestException(
      `Availability must be boolean-like (true/false, yes/no, 1/0). Received: "${value}"`,
    );
  }
}
