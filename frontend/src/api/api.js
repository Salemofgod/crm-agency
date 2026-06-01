const api = {
  get: (url) => fetch('/api' + url, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw { response: { data, status: r.status } };
    return { data };
  }),

  post: (url, body) => fetch('/api' + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('crm_token'),
    },
    body: JSON.stringify(body),
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw { response: { data, status: r.status } };
    return { data };
  }),

  put: (url, body) => fetch('/api' + url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('crm_token'),
    },
    body: JSON.stringify(body),
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw { response: { data, status: r.status } };
    return { data };
  }),

  delete: (url) => fetch('/api' + url, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('crm_token') },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw { response: { data, status: r.status } };
    return { data };
  }),
};

export default api;