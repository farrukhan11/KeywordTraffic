import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import KeywordProject from '@/models/KeywordProject';

export async function GET(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    await connectToDatabase();
    const projects = await KeywordProject.find({ userId: authResult.user.uid })
      .sort({ createdAt: -1 })
      .select('-metricsLock');
    return Response.json({ projects });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  try {
    const body = await request.json();
    const { name, description, country, countryName, language, languageName, network } = body;

    if (!name || !country || !countryName || !language || !languageName || !network) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    const project = await KeywordProject.create({
      userId: authResult.user.uid,
      name,
      description: description || '',
      targetCountryCode: country,
      targetCountryName: countryName,
      languageCode: language,
      languageName: languageName,
      network,
      status: 'DRAFT',
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
