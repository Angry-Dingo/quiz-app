// 答题记录 API
export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const data = await request.json();
    const userId = data.username || 'anonymous';
    const historyId = `history_${Date.now()}_${userId}`;
    
    await env.USER_HISTORY.put(historyId, JSON.stringify(data));
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
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

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || 'anonymous';
    
    const allHistory = [];
    const keys = await env.USER_HISTORY.list({ prefix: `history_` });
    
    for (const key of keys.keys) {
      if (key.name.includes(username)) {
        const history = await env.USER_HISTORY.get(key.name);
        if (history) {
          allHistory.push(JSON.parse(history));
        }
      }
    }
    
    return new Response(
      JSON.stringify(allHistory),
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