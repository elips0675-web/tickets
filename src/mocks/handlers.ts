import { http, HttpResponse } from 'msw'

const API = 'http://localhost:4000/api'

export const handlers = [
  http.get(`${API}/polls`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, title: 'Тестовый опрос', description: '', multiple_choice: 0, options: [
          { id: 1, text: 'Вариант А', votes_count: 1, voted: 1 },
          { id: 2, text: 'Вариант Б', votes_count: 0, voted: 0 },
        ], myVotes: [1], totalVotes: 1, multipleChoice: false },
      ],
      total: 1,
    })
  }),

  http.post(`${API}/polls`, () => {
    return HttpResponse.json({ id: 2, title: 'Новый опрос', multiple_choice: 0 })
  }),

  http.post(`${API}/polls/:id/vote`, () => {
    return HttpResponse.json({ id: 1, title: 'Тестовый опрос', options: [], totalVotes: 2, multipleChoice: false })
  }),
]
