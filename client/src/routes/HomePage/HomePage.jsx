<>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pokemon Card Price Tracker</title>
  <link rel="stylesheet" href="styles.css" />
  {/* Nav Bar */}
  <header>
    <nav className="navbar">
      <div className="nav-title" />
      <ul className="nav-links">
        <li>
          <a href="#">Search</a>
        </li>
        <li>
          <a href="#">Collection</a>
        </li>
        <li>
          <a href="#">Upload</a>
        </li>
      </ul>
      <a href="#" className="sign-in-btn">
        Sign in &gt;
      </a>
    </nav>
  </header>
  {/* Main Content */}
  <main>
    <div className="container">
      {/* Left Side: search bar and the description */}
      <div className="left-content">
        <h1>
          Find your <br />
          Pokémon Collection’s Worth
        </h1>
        <p>
          This will change the way you track the prices of your Pokemon cards.
          Search your card below.
        </p>
        <div className="search-bar">
          <input type="text" placeholder="Search for your card..." />
          <button>
            <img
              src="../client/src/assets/images/magnifyingGlass.png"
              alt="Search"
              width="15px"
            />
          </button>
        </div>
      </div>
      {/* Right Side: Charizard card (maybe randomize different card img?)*/}
      <div className="right-content">
        <img
          src="../client/src/assets/images/charizard.png"
          alt="Charizard Card"
          className="card-image"
        />
      </div>
    </div>
  </main>
</>
