import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Keyword from '@/models/Keyword';
import KeywordProject from '@/models/KeywordProject';
import { normalizeKeyword } from '@/utils/keywordNormalization';

export async function POST(request, { params }) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  const { projectId } = await params;

  try {
    await connectToDatabase();
    const project = await KeywordProject.findOne({ _id: projectId, userId: authResult.user.uid });
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { keywords, source } = body;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return Response.json({ error: 'No keywords provided' }, { status: 400 });
    }

    const validSource = ['PASTE', 'CSV'].includes(source) ? source : 'PASTE';
    const results = [];
    let validCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i];
      const rowNumber = i + 1;
      const result = normalizeKeyword(kw, rowNumber);

      if (!result.isValid) {
        results.push({ keyword: kw, status: 'INVALID', error: result.error });
        continue;
      }

      const exists = await Keyword.findOne({
        projectId,
        normalizedKeyword: result.normalized,
      });

      if (exists) {
        duplicateCount++;
        results.push({ keyword: kw, status: 'DUPLICATE', normalizedKeyword: result.normalized });
        continue;
      }

      const created = await Keyword.create({
        projectId,
        originalKeyword: result.original || kw,
        normalizedKeyword: result.normalized,
        status: 'PENDING',
        source: validSource,
        rowNumber,
      });

      validCount++;
      results.push({ keyword: kw, status: 'CREATED', normalizedKeyword: result.normalized, id: created._id });
    }

    const totalKeywords = await Keyword.countDocuments({ projectId });
    const uniqueKeywords = await Keyword.distinct('normalizedKeyword', { projectId });

    await KeywordProject.findOneAndUpdate(
      { _id: projectId },
      {
        totalKeywords,
        uniqueKeywords: uniqueKeywords.length,
        duplicateKeywords: totalKeywords - uniqueKeywords.length,
      }
    );

    return Response.json({
      imported: validCount,
      duplicates: duplicateCount,
      totalKeywords,
      uniqueKeywords: uniqueKeywords.length,
      results,
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to import keywords' }, { status: 500 });
  }
}
