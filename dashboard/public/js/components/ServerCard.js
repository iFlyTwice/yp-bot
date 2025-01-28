const ServerCard = ({ server }) => {
  const { name, iconURL, settingsUrl } = server;
  const isInvite = settingsUrl.includes('discordapp.com');

  return React.createElement(
    'div',
    { 
      className: 'bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden hover:border-zinc-500 transition-colors'
    },
    React.createElement(
      'div',
      { className: 'border-b border-zinc-700 px-4 py-3 flex items-center justify-between' },
      React.createElement(
        'h3',
        { className: 'text-lg font-medium text-white truncate' },
        name
      ),
      React.createElement('i', { 
        className: 'fas fa-crown text-yellow-500',
        'aria-label': 'Server Owner'
      })
    ),
    React.createElement(
      'div',
      { className: 'p-6 flex flex-col items-center gap-4' },
      React.createElement('img', {
        src: iconURL || 'https://cdn.discordapp.com/embed/avatars/0.png',
        className: 'w-24 h-24 rounded-full bg-zinc-700 object-cover',
        alt: `${name} icon`
      }),
      React.createElement(
        'a',
        { 
          href: settingsUrl,
          className: 'w-full'
        },
        React.createElement(
          'button',
          {
            className: isInvite 
              ? 'w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition-colors' 
              : 'w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors'
          },
          isInvite ? 'Invite' : 'Manage'
        )
      )
    )
  );
};

// Mount component when document is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('server-grid');
  if (container) {
    const serverDataStr = container.getAttribute('data-servers');
    if (serverDataStr) {
      try {
        const serverData = JSON.parse(decodeURIComponent(serverDataStr));
        const root = ReactDOM.createRoot(container);
        root.render(
          React.createElement(
            'div',
            { 
              className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn'
            },
            serverData.map(server => 
              React.createElement(ServerCard, { 
                key: server.id || Math.random().toString(36).substr(2, 9), 
                server 
              })
            )
          )
        );
      } catch (error) {
        console.error('Error parsing server data:', error);
        container.innerHTML = `
          <div class="bg-red-900/20 border border-red-500 text-red-100 px-4 py-3 rounded">
            Error loading servers. Please try refreshing the page.
          </div>
        `;
      }
    }
  }
});
