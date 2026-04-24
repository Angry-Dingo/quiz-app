// 题目操作 API

// 更新题目解析
export async function onRequestPut(context) {
  try {
    const { env, request } = context
    const data = await request.json()
    const questionId = data.questionId
    const explanation = data.explanation
    const userId = data.userId
    const isExam = data.isExam || false  // 添加题库类型参数

    console.log('收到更新题目解析请求:', { questionId, explanation, userId, isExam })

    // 检查必要参数
    if (!questionId || !explanation) {
      console.log('缺少必要参数:', { questionId, explanation })
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // 根据题库类型选择KV命名空间
    const kvNamespace = isExam ? env.EXAM_QUESTION_BANK : env.QUESTION_BANK
    console.log('选择的KV命名空间:', isExam ? 'EXAM_QUESTION_BANK' : 'QUESTION_BANK')

    // 检查KV命名空间是否存在
    if (!kvNamespace) {
      console.log('KV命名空间不存在:', isExam ? 'EXAM_QUESTION_BANK' : 'QUESTION_BANK')
      return new Response(
        JSON.stringify({ success: false, message: 'KV namespace not bound' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // 从 KV 获取所有题目
    console.log('开始从KV获取题目...')
    const allQuestions = await kvNamespace.get('all_questions')
    if (!allQuestions) {
      console.log('KV中没有题目数据')
      return new Response(
        JSON.stringify({ success: false, message: 'Questions not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    const questions = JSON.parse(allQuestions)
    console.log('题库中题目数量:', questions.length)
    console.log('题库中前5题的ID:', questions.slice(0, 5).map(q => q.id || '无ID'))

    // 查找并更新题目
    let found = false
    const updatedQuestions = questions.map((q, index) => {
      console.log('检查题目', index, 'ID:', q.id, '类型:', typeof q.id)
      console.log('对比目标ID:', questionId, '类型:', typeof questionId)
      
      // 尝试多种ID匹配方式
      if (q.id === questionId || 
          q.id == questionId || 
          q.id.toString() === questionId.toString() ||
          q.question === questionId) {
        console.log('找到匹配的题目:', {
          index: index,
          id: q.id,
          question: q.question.substring(0, 50) + '...'
        })
        found = true
        return {
          ...q,
          explanation,
          explanationAddedBy: userId,
          explanationAddedAt: new Date().toISOString()
        }
      }
      return q
    })

    if (!found) {
      console.log('未找到匹配的题目，尝试通过题目内容匹配')
      // 尝试通过题目内容匹配
      const updatedQuestionsByContent = questions.map((q, index) => {
        if (q.question && q.question.includes(questionId)) {
          console.log('通过题目内容找到匹配的题目:', {
            index: index,
            id: q.id,
            question: q.question.substring(0, 50) + '...'
          })
          found = true
          return {
            ...q,
            explanation,
            explanationAddedBy: userId,
            explanationAddedAt: new Date().toISOString()
          }
        }
        return q
      })
      
      if (found) {
        console.log('通过题目内容匹配，开始更新KV...')
        await kvNamespace.put('all_questions', JSON.stringify(updatedQuestionsByContent))
        console.log('通过题目内容匹配，更新成功')
      } else {
        console.log('未找到任何匹配的题目')
        return new Response(
          JSON.stringify({ success: false, message: 'Question not found' }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }
    } else {
      // 保存更新后的题目
      console.log('找到匹配的题目，开始更新KV...')
      await kvNamespace.put('all_questions', JSON.stringify(updatedQuestions))
      console.log('题目解析更新成功')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Explanation added successfully' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('更新题目解析失败:', error)
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
}