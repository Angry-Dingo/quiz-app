// 历史记录 API
export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    // 检查 USER_HISTORY 是否存在
    if (!env.USER_HISTORY) {
      return new Response(
        JSON.stringify({ error: 'USER_HISTORY KV namespace not bound' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // 尝试列出所有 KV 键
    const keys = await env.USER_HISTORY.list();
    
    // 如果没有找到任何键，返回空数组
    if (keys.keys.length === 0) {
      return new Response(
        JSON.stringify([]),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    
    // 获取所有历史记录
    const allHistory = [];
    
    for (const key of keys.keys) {
      const history = await env.USER_HISTORY.get(key.name);
      if (history) {
        try {
          const parsedHistory = JSON.parse(history);
          allHistory.push(parsedHistory);
        } catch (parseError) {
          // 解析失败，跳过该记录
        }
      }
    }
    
    // 返回获取到的历史记录
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