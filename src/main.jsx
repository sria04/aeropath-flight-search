import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const paths = {
    plane: <><path d="m21 3-8.3 18-2.8-7.9L2 10.3 21 3Z"/><path d="m9.9 13.1 4.6-4.6"/></>,
    arrow: <><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></>,
    swap: <><path d="M4 7h16"/><path d="m15 3 5 4-5 4"/><path d="M20 17H4"/><path d="m9 13-5 4 5 4"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    route: <><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h5a4 4 0 0 0 0-8h-1a4 4 0 0 1 0-8h6"/></>,
    check: <path d="m5 12 4.5 4.5L19 7"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest ? `${rest}m` : ''}`.trim() : `${rest}m`;
}

// Decorative hero artwork; search results are displayed in RouteCard below.
function HeroVisual() {
  return <div className="hero-visual" aria-hidden="true">
    <div className="visual-disc" />
    <div className="visual-ticket">
      <div className="ticket-top"><span>AEROPATH / ROUTE CARD</span><span>AP — 01</span></div>
      <div className="ticket-center"><span className="ticket-icon"><Icon name="plane" size={56} strokeWidth={1.3}/></span><strong>FIND YOUR<br/>WAY FORWARD.</strong></div>
      <div className="ticket-bottom"><span>SEARCH</span><i/><span>COMPARE</span><i/><span>GO</span></div>
    </div>
  </div>;
}

// Displays one returned route: cities, stops, total time, and total cost.
function RouteCard({ route, index, sort }) {
  const stops = route.cities.length - 2;
  return <article className={`route-card ${index === 0 ? 'route-card-featured' : ''}`}>
    <div className="card-rank"><span>OPTION</span><strong>{String(index + 1).padStart(2, '0')}</strong></div>
    <div className="card-journey">
      <div className="card-journey-top">
        {index === 0 ? <span className="best-tag"><Icon name="check" size={14}/>{sort === 'cost' ? 'LOWEST COST' : 'SHORTEST TIME'}</span> : <span className="alternate-tag">ANOTHER WAY THERE</span>}
        <span className="stop-count">{stops === 0 ? 'DIRECT' : `${stops} ${stops === 1 ? 'STOP' : 'STOPS'}`}</span>
      </div>
      <div className="route-endpoints">
        <div className="endpoint"><span>FROM</span><strong>{route.cities[0]}</strong></div>
        <div className="flight-line"><span/><Icon name="arrow" size={21}/><span/></div>
        <div className="endpoint endpoint-destination"><span>TO</span><strong>{route.cities.at(-1)}</strong></div>
      </div>
      <div className="stop-row"><Icon name="route" size={16}/>{stops === 0 ? 'Direct route' : `Via ${route.cities.slice(1, -1).join(' · ')}`}</div>
    </div>
    <div className="card-stats">
      <div><span><Icon name="clock" size={15}/> TOTAL TIME</span><strong>{formatTime(route.totalTime)}</strong></div>
      <div><span>TOTAL COST</span><strong className="price">${route.totalCost}</strong></div>
    </div>
  </article>;
}

function App() {
  // Form choices, ranking, results, and feedback shown on the page.
  const [cities, setCities] = useState([]);
  const [from, setFrom] = useState('Boston');
  const [to, setTo] = useState('New York');
  const [sort, setSort] = useState('cost');
  // The displayed results use the last submitted cities, not unsent form changes.
  const [activeSearch, setActiveSearch] = useState({ from: 'Boston', to: 'New York' });
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  // Populate both city dropdowns from the Java API when the page opens.
  useEffect(() => {
    fetch('/api/cities')
      .then(async response => {
        if (!response.ok) throw new Error('Could not load the city list.');
        return response.json();
      })
      .then(data => setCities(data.cities))
      .catch(() => setError('Could not connect to the flight server. Start the app with npm run dev.'));
  }, []);

  // Request new routes when the submitted city pair or ranking changes.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ ...activeSearch, sort });
    fetch(`/api/routes?${params}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load routes.');
        return data;
      })
      .then(data => { setRoutes(data.routes); setLoading(false); })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setRoutes([]);
          setError(err.message || 'Could not load routes.');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [activeSearch, sort]);

  // Validate and submit the selected cities when Find routes is clicked.
  function submitSearch(event) {
    event.preventDefault();
    if (from === to) {
      setFormError('Choose two different cities to explore routes.');
      return;
    }
    setFormError('');
    setActiveSearch({ from, to });
  }

  // Swap the form choices; the user then submits the reversed route.
  function swapCities() {
    setFrom(to);
    setTo(from);
    setFormError('');
  }

  return <div className="app-shell">
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand"><span className="brand-mark"><Icon name="plane" size={19} strokeWidth={2.1}/></span><span>AEROPATH<span className="brand-period">.</span></span></div>
        <div className="header-right"><span className="header-line"/> THE FLIGHT ROUTE EXPLORER</div>
      </div>
    </header>

    <main>
      {/* Intro and decorative ticket */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot"/> ROUTE PLANNING, MADE SIMPLE</span>
            <h1>Find the way<br/><span>that fits.</span></h1>
            <p>See the best paths between cities, compare what matters to you, and know every stop before you go.</p>
            <div className="hero-note"><Icon name="check" size={16}/> Clear choices from a sample U.S. flight network</div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Departure, arrival, swap, and search controls */}
      <section className="search-section container" aria-label="Flight route search">
        <form className="search-card" onSubmit={submitSearch}>
          <div className="search-card-header"><div><span className="section-kicker">01 / PLAN YOUR ROUTE</span><h2>Where to next?</h2></div><span className="search-header-icon"><Icon name="route" size={22}/></span></div>
          <div className="search-fields">
            <label className="city-field"><span className="field-label">DEPARTURE</span><span className="select-wrap"><Icon name="pin" size={19}/><select aria-label="Departure city" value={from} onChange={event => { setFrom(event.target.value); setFormError(''); }}>{cities.length ? cities.map(city => <option key={city}>{city}</option>) : <option>{from}</option>}</select></span></label>
            <button className="swap-button" type="button" onClick={swapCities} aria-label="Swap departure and destination"><Icon name="swap" size={19}/></button>
            <label className="city-field"><span className="field-label">ARRIVAL</span><span className="select-wrap"><Icon name="pin" size={19}/><select aria-label="Destination city" value={to} onChange={event => { setTo(event.target.value); setFormError(''); }}>{cities.length ? cities.map(city => <option key={city}>{city}</option>) : <option>{to}</option>}</select></span></label>
            <button className="search-button" type="submit"><span>Find routes</span><Icon name="arrow" size={19}/></button>
          </div>
          {formError && <div className="form-error" role="alert">{formError}</div>}
          <div className="search-card-footer"><Icon name="info" size={15}/> Choose any two cities in the sample network</div>
        </form>
      </section>

      {/* Ranking controls and route cards returned by the API */}
      <section className="results-section container" aria-live="polite">
        <div className="results-heading">
          <div><span className="section-kicker">02 / COMPARE YOUR OPTIONS</span><h2>Routes worth a look.</h2><p><strong>{activeSearch.from}</strong> <span className="summary-arrow">→</span> <strong>{activeSearch.to}</strong> <span className="summary-dot">·</span> {loading ? 'Searching…' : `${routes.length} ${routes.length === 1 ? 'option' : 'options'} found`}</p></div>
          <div className="sort-control" aria-label="Rank routes by"><span>RANK BY</span><div className="sort-buttons"><button type="button" aria-pressed={sort === 'cost'} className={sort === 'cost' ? 'active' : ''} onClick={() => setSort('cost')}>Lowest cost</button><button type="button" aria-pressed={sort === 'time'} className={sort === 'time' ? 'active' : ''} onClick={() => setSort('time')}>Shortest time</button></div></div>
        </div>
        <div className="route-list">{loading ? <div className="state-card">Finding the best routes…</div> : error ? <div className="state-card error-card">{error}</div> : routes.length ? routes.map((route, index) => <RouteCard key={`${sort}-${route.cities.join('-')}`} route={route} index={index} sort={sort}/>) : <div className="state-card">No route found for these cities.</div>}</div>
        <p className="results-note"><Icon name="info" size={15}/> Sample flight network and values for demonstration. No live fares or schedules.</p>
      </section>
    </main>

    <footer className="site-footer"><div className="container footer-inner"><div className="brand footer-brand"><span className="brand-mark"><Icon name="plane" size={17}/></span><span>AEROPATH<span className="brand-period">.</span></span></div><span>Find a better way there.</span><span>FLIGHT ROUTE EXPLORER / DEMO PROJECT</span></div></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
