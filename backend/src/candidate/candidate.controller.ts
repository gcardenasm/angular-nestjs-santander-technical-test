import { Controller, Post, UploadedFile, UseInterceptors, Body, Get, Delete, HttpCode, Param, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidateService } from './candidate.service';
import { CandidateDto } from './dto/candidate.dto';

@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) { }

  /**
   * Returns the list of persisted candidates.
   * Used by the frontend to hydrate the UI on refresh.
   * @returns Array of candidates in reverse chronological order.
   */
  @Get()
  findAll() {
    return this.candidateService.findAll();
  }


  /**
   * Accepts a `multipart/form-data` request containing candidate metadata and an Excel file.
   * @param file - Uploaded Excel file (field name: `file`).
   * @param body - Request body with `name` and `surname`.
   * @returns Saved candidate entity.
   * @throws BadRequestException When the file is missing or the Excel is invalid.
   *
   * @example
   *  Using curl:
   *  curl -X POST http://localhost:3000/candidates \
   *    -F "name=Ada" \
   *    -F "surname=Lovelace" \
   *    -F "file=@./cand.xlsx"
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadCandidate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CandidateDto,
  ) {
    return this.candidateService.processCandidate(body, file);
  }

    /**
   * DELETE /candidates/:id
   *
   * Deletes a single candidate by id.
   *
   * @param id - Candidate identifier (path param).
   * @returns No content on success.
   * @throws NotFoundException When the candidate does not exist.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.candidateService.remove(id);
  }

  /**
   * DELETE /candidates
   *
   * Deletes all candidates.
   * Useful for quickly resetting the dataset during demos/tests.
   *
   * @returns An object with the number of deleted rows.
   */
  @Delete()
  async removeAll(): Promise<{ deleted: number }> {
    const deleted = await this.candidateService.removeAll();
    return { deleted };
  }
}