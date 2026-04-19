// 考试题库 API
export async function onRequestGet(context) {
  try {
    const { env } = context;
    const questions = await env.EXAM_QUESTION_BANK.get('all_questions');
    
    return new Response(
      questions || '[]',
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}