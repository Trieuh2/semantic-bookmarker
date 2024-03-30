chrome.action.onClicked.addListener((tab) => {
  fetch('https://your-nextjs-site.com/api/data', { // Replace with route to hit
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: 'value' }), // Replace with the data you want to send
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error));
});
