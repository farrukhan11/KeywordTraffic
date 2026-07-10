import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import KeywordProject from '@/models/KeywordProject';
import Keyword from '@/models/Keyword';

export async function GET(request, { params }) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error.message }, { status: authResult.error.status });
  }

  const { projectId } = await params;

  try {
    await connectToDatabase();
    const project = await KeywordProject.findOne({ _id: projectId, userId: authResult.user.uid })
      .select('-metricsLock');
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const keywords = await Keyword.find({ projectId })
      .sort({ rowNumber: 1 });

    return Response.json({ project, keywords });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    await Keyword.deleteMany({ projectId });
    await KeywordProject.deleteOne({ _id: projectId });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
