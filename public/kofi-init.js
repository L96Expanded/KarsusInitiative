// Don't show the Ko-fi widget on the encounter visual view
if (!window.location.pathname.match(/\/encounters\/[^/]+\/view/)) {
  kofiWidgetOverlay.draw('barope', {
    'type': 'floating-chat',
    'floating-chat.donateButton.text': 'Support Us',
    'floating-chat.donateButton.background-color': '#fcbf47',
    'floating-chat.donateButton.text-color': '#323842'
  });
}
