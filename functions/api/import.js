// 导入题库 API
export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const data = await request.json();
    const questions = data.questions;
    const collection = data.collection;

    // 检查必要的参数
    if (!questions || !Array.isArray(questions) || !collection) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // 根据 collection 确定 KV 命名空间
    let kvNamespace;
    if (collection === 'questions') {
      kvNamespace = env.QUESTION_BANK;
    } else if (collection === 'exam_questions') {
      kvNamespace = env.EXAM_QUESTION_BANK;
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid collection' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // 检查 KV 命名空间是否存在
    if (!kvNamespace) {
      return new Response(
        JSON.stringify({ success: false, message: 'KV namespace not bound' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // 保存题目到 KV
    try {
      await kvNamespace.put('all_questions', JSON.stringify(questions));
      return new Response(
        JSON.stringify({ success: true, totalQuestions: questions.length }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}