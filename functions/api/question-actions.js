// 题目操作 API
import { Router } from 'itty-router'

const router = Router()

// 更新题目解析
router.put('/api/question/:id/explanation', async (request, env) => {
  try {
    const questionId = request.params.id
    const data = await request.json()
    const explanation = data.explanation
    const userId = data.userId
    const isExam = data.isExam || false  // 添加题库类型参数

    // 检查必要参数
    if (!questionId || !explanation) {
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

    // 从 KV 获取所有题目
    const allQuestions = await kvNamespace.get('all_questions')
    if (!allQuestions) {
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

    // 查找并更新题目
    const updatedQuestions = questions.map(q => {
      if (q.id.toString() === questionId) {
        return {
          ...q,
          explanation,
          explanationAddedBy: userId,
          explanationAddedAt: new Date().toISOString()
        }
      }
      return q
    })

    // 保存更新后的题目
    await kvNamespace.put('all_questions', JSON.stringify(updatedQuestions))

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
})

// 导出路由
export default {
  fetch: router.handle
}