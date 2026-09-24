import { useEffect, useRef, useState } from 'react';
import './App.css';
import birthdayData from './data/birthdayData';

const actDurations = [
  4000,
  5000,
  5000,
  5000,
  6000,
  8000,
  9000,
  6000,
  6000,
  18000,
  10000,
  26000,
  17000,
  18000,
  10000,
  10000,
  10000,
  8000,
  7000,
  5000,
];

const secretRunes = ['2', '0', 'M', 'A', 'R', 'G', '*', '+', '/', '%'];
const memoryLabels = [
  'Your smile.',
  'Your energy.',
  'Your little moments.',
  'Everything that makes you...',
  '...you.',
];

const digitalChars = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  value: secretRunes[index % secretRunes.length],
  left: `${(index * 11) % 100}%`,
  top: `${(index * 17) % 100}%`,
  duration: `${2.8 + (index % 9) * 0.7}s`,
  delay: `${(index % 8) * 0.4}s`,
}));

function Atmosphere({ stage, photos }) {
  const backgroundPhotos = photos.slice(0, 5);
  const confettiPieces = Array.from({ length: 22 }, (_, index) => index);
  const fireflies = Array.from({ length: 12 }, (_, index) => index);
  const petals = Array.from({ length: 10 }, (_, index) => index);

  return (
    <div className={`atmosphere atmosphere-stage-${stage}`} aria-hidden="true">
      <div className="atmosphere-aurora" />
      <div className="atmosphere-stars" />
      <div className="atmosphere-particles" />
      <div className="atmosphere-rays" />
      <div className="atmosphere-sunburst" />
      <div className="atmosphere-ribbons">
        <span />
        <span />
        <span />
      </div>
      <div className="atmosphere-confetti">
        {confettiPieces.map((piece) => (
          <span
            key={piece}
            style={{
              left: `${(piece * 13) % 96}%`,
              '--confetti-rotation': `${-35 + (piece * 19)}deg`,
              animationDuration: `${8 + (piece * 0.4)}s`,
              animationDelay: `${piece * -0.7}s`,
            }}
          />
        ))}
      </div>
      <div className="atmosphere-fireflies">
        {fireflies.map((firefly) => (
          <span
            key={firefly}
            style={{
              left: `${7 + ((firefly * 19) % 88)}%`,
              top: `${12 + ((firefly * 31) % 72)}%`,
              animationDuration: `${4 + (firefly * 0.4)}s`,
              animationDelay: `${firefly * -0.6}s`,
            }}
          />
        ))}
      </div>
      <div className="atmosphere-petals">
        {petals.map((petal) => (
          <span
            key={petal}
            style={{
              left: `${4 + ((petal * 23) % 92)}%`,
              animationDuration: `${10 + (petal * 0.6)}s`,
              animationDelay: `${petal * -1.2}s`,
            }}
          />
        ))}
      </div>
      <div className="atmosphere-photo-memory">
        {backgroundPhotos.map((photo, index) => (
          <img key={photo} src={photo} alt="" loading="lazy" style={{ '--memory-index': index }} />
        ))}
      </div>
      <div className="atmosphere-photo-heart">
        {backgroundPhotos.map((photo, index) => (
          <img
            key={`${photo}-heart`}
            src={photo}
            alt=""
            loading="lazy"
            style={{
              '--heart-index': index,
              left: `${30 + ((index % 3) * 17)}%`,
              top: `${22 + (Math.floor(index / 3) * 18)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function InteractiveMemory({ photo, index, isFront, onBringForward }) {
  const [position, setPosition] = useState({
    x: [4, 28, 55, 72, 34][index] || 10,
    y: [18, 7, 21, 8, 55][index] || 20,
    rotation: [-5, 4, -3, 6, -6][index] || 0,
  });
  const dragStart = useRef(null);

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: position.x,
      y: position.y,
      moved: false,
    };
    onBringForward(index);
  };

  const handlePointerMove = (event) => {
    if (!dragStart.current) return;
    const deltaX = ((event.clientX - dragStart.current.pointerX) / window.innerWidth) * 100;
    const deltaY = ((event.clientY - dragStart.current.pointerY) / window.innerHeight) * 100;
    if (Math.abs(deltaX) > 0.4 || Math.abs(deltaY) > 0.4) dragStart.current.moved = true;
    setPosition((current) => ({
      ...current,
      x: Math.max(-6, Math.min(82, dragStart.current.x + deltaX)),
      y: Math.max(2, Math.min(72, dragStart.current.y + deltaY)),
    }));
  };

  const handlePointerUp = () => {
    dragStart.current = null;
  };

  const rotatePhoto = () => {
    if (dragStart.current?.moved) return;
    setPosition((current) => ({ ...current, rotation: current.rotation + 12 }));
  };

  return (
    <div
      className="playground-photo"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `rotate(${position.rotation}deg)`,
        '--memory-index': index,
        zIndex: isFront ? 20 : index + 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={rotatePhoto}
      role="button"
      tabIndex={0}
      aria-label={`Move memory ${index + 1}`}
    >
      <img src={photo} alt="My love memory" draggable="false" />
      <span className="playground-pin" />
    </div>
  );
}

function App() {
  const [stage, setStage] = useState(0);
  const [cardOpen, setCardOpen] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [frontMemory, setFrontMemory] = useState(0);
  const audioRef = useRef(null);

  const startMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.8;
    audioRef.current.play().catch(() => undefined);
  };

  const advanceStory = () => {
    startMusic();
    setStage((current) => {
      if (current === 8) return 10;
      if (current === 11) return 13;
      if (current === 13) return 16;
      return Math.min(current + 1, actDurations.length - 1);
    });
  };

  const goBack = () => {
    setStage((current) => {
      if (current === 10) return 8;
      if (current === 13) return 11;
      if (current === 16) return 13;
      return Math.max(current - 1, 0);
    });
  };

  useEffect(() => {
    setCardOpen(false);

    if (stage === 0) {
      setSecretUnlocked(false);
      const timer = window.setTimeout(advanceStory, actDurations[0]);
      return () => window.clearTimeout(timer);
    }

    if (stage === actDurations.length - 1) {
      const timer = window.setTimeout(() => setSecretUnlocked(true), 2000);
      return () => window.clearTimeout(timer);
    }

    setSecretUnlocked(false);
    return undefined;
  }, [stage]);

  const musicSource = '/assets/birthday-song.mp3';

  useEffect(() => {
    startMusic();
    window.addEventListener('pointerdown', startMusic, { once: true });
    window.addEventListener('keydown', startMusic, { once: true });
    window.addEventListener('touchstart', startMusic, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', startMusic);
      window.removeEventListener('keydown', startMusic);
      window.removeEventListener('touchstart', startMusic);
    };
  }, []);

  const heartPhotos = birthdayData.photos.slice(0, 8);

  return (
    <main className="birthday-world">
      <Atmosphere stage={stage} photos={birthdayData.photos} />
      <audio ref={audioRef} className="hidden-audio" src={musicSource} loop autoPlay preload="auto" />

      {stage > 0 && stage < actDurations.length - 1 && (
        <button type="button" className="story-continue" onClick={advanceStory}>
          Continue
        </button>
      )}

      {stage > 0 && (
        <button type="button" className="story-back" onClick={goBack}>
          Back
        </button>
      )}

      {stage === 0 && (
        <section className="scene secret-scene is-active">
          <div className="secret-vignette" />
          <div className="secret-particles" aria-hidden="true">
            {digitalChars.map((char) => (
              <span
                key={char.id}
                className="secret-char"
                style={{
                  left: char.left,
                  top: char.top,
                  animationDuration: char.duration,
                  animationDelay: char.delay,
                }}
              >
                {char.value}
              </span>
            ))}
          </div>
          <div className="pulse-dot" />
        </section>
      )}

      {stage === 1 && (
        <section className="scene number-scene is-active">
          <div className="digital-rain" aria-hidden="true" />
          <div className="number-glow" aria-hidden="true" />
          <div className="number-display" data-content="20">20</div>
        </section>
      )}

      {stage === 2 && (
        <section className="scene reveal-scene is-active">
          <div className="digital-rain" aria-hidden="true" />
          <div className="reveal-number">20</div>
          <div className="title-sparkles" aria-hidden="true">
            {Array.from({ length: 140 }, (_, index) => (
              <span
                key={index}
                style={{
                  left: `${(index * 37) % 100}%`,
                  top: `${(index * 61) % 100}%`,
                  animationDelay: `${(index % 30) * -0.12}s`,
                  animationDuration: `${2.4 + (index % 12) * 0.22}s`,
                  '--spark-size': `${2 + (index % 4)}px`,
                  '--spark-hue': `${320 + (index % 5) * 8}`,
                }}
              />
            ))}
          </div>
          <div className="birthday-word" aria-label="HAPPY 20th BIRTHDAY MY BELOVED">
            <span className="title-line title-happy">HAPPY</span>
            <span className="title-line title-birthday">20th BIRTHDAY</span>
            <span className="title-line title-beloved">MY BELOVED</span>
          </div>
        </section>
      )}

      {stage === 3 && (
        <section className="scene name-scene is-active">
          <div className="digital-rain soft" aria-hidden="true" />
          <div className="name-block">
            <div className="name-message">
              <span>HUNNY I MADE THIS WORLD FOR YOU</span>
              <span>TO CONGRATULATE YOU FOR TURNING 20.</span>
              <strong>WELCOME TO THE WORLD OF 20s</strong>
            </div>
          </div>
        </section>
      )}

      {stage === 4 && (
        <section className="scene starfield-scene is-active">
          <div className="starfield" aria-hidden="true" />
          <div className="dust-field" aria-hidden="true" />
          <div className="night-title-wrap">
            <div className="night-title">MY LOVE</div>
            <div className="night-subtitle">MI AMOR</div>
          </div>
        </section>
      )}

      {stage === 5 && (
        <section className="scene celebration-scene is-active">
          <div className="starfield" aria-hidden="true" />
          <div className="real-photo-reveal">
            <div className="real-photo-frame">
              <img src={birthdayData.photos[0]} alt="My love" />
            </div>
            <div className="photo-glow-ring" aria-hidden="true" />
          </div>
          <div className="tiny-hearts" aria-hidden="true">
            <span className="float-heart small h1" />
            <span className="float-heart small h2" />
            <span className="float-heart small h3" />
            <span className="float-heart small h4" />
          </div>
          <div className="celebration-copy">
            <p>"My love turned 20 today..."</p>
            <p>"and I made this little world for you, mi amor."</p>
          </div>
        </section>
      )}

      {stage === 6 && (
        <section className="scene card-scene is-active">
          <div className="card-shell" aria-label="birthday card">
            <div className="card-photo-wrap">
              <img src={birthdayData.photos[1]} alt="My beautiful girl" />
            </div>
            <div className="card-content">
              <p className="card-kicker">For Her Majesty, the Queen</p>
              <h2>Turning the big 2 and 0</h2>
              <div className="card-age">20</div>
            </div>
          </div>
        </section>
      )}

      {stage === 7 && (
        <section className="scene card-open-scene is-active" onClick={() => setCardOpen((value) => !value)}>
          <div className="card-action">Tap the card...</div>
          <div className={`open-card ${cardOpen ? 'is-open' : ''}`}>
            <div className="card-front">
              <div className="card-photo-wrap">
                <img src={birthdayData.photos[1]} alt="My beautiful girl" />
              </div>
              <div className="card-content">
                <p className="card-kicker">For Her Majesty, the Queen</p>
                <h2>Turning the big 2 and 0</h2>
                <div className="card-age">20</div>
              </div>
            </div>

            <div className="card-back">
              <p>"My love, you are the softest and brightest part of my life."</p>
              <p>"Every day with you feels like a gift I never want to take for granted."</p>
              <p>"Happy 20th birthday, mi amor. This is only the beginning of everything beautiful waiting for you."</p>
              <small>With all my love, Robbinson Griffons</small>
            </div>
          </div>
        </section>
      )}

      {stage === 8 && (
        <section className="scene memory-scene is-active">
          <div className="single-photo-wrap">
            <div className="single-photo-frame">
              <img src={birthdayData.photos[0]} alt="My love" />
            </div>
            <div className="photo-caption">One memory.</div>
          </div>
        </section>
      )}

      {stage === 10 && (
        <section className="scene quiet-scene is-active">
          <div className="quiet-copy">
            <p>But...</p>
            <p>there's something I really want you to remember.</p>
            <p>You deserve to be celebrated.</p>
          </div>
        </section>
      )}

      {stage === 11 && (
        <section className="scene letter-scene is-active">
          <div className="letter-card">
            <p className="letter-title">Dear My Love,</p>
            <p className="letter-subtitle">Happy 20th Birthday, Mi Amor.</p>
            <div className="letter-body">
              <p>My love, today I get to celebrate you: your beautiful heart, your gentle spirit, your strength, your laughter, and every little thing that makes you the person I adore.</p>
              <p>Twenty is only the beginning, mi amor. I hope this new chapter brings you moments that make you laugh until your stomach hurts, dreams that make your eyes shine, and memories you will carry with you forever.</p>
              <p>I want you to know that you are loved in the quiet moments too. When the day is ordinary, when you feel tired, when you doubt yourself, I will still see the beautiful woman you are. You never have to earn my love by being perfect. You are already more than enough.</p>
              <p>Thank you for the warmth you bring into my life, for the way your presence makes everything feel softer, and for all the memories we have made together. I am grateful for you in more ways than I can fit onto one page.</p>
              <p>May twenty bring you peace, confidence, adventure, and every happiness your heart has been waiting for. Keep being my beautiful girl, my heart, my safe place, my favorite person.</p>
              <p>I love you more than these words can hold. Happy birthday, my love. I am so proud of you, and I cannot wait to see everything that is still ahead of you.</p>
              <p className="letter-signoff">Forever yours,<br />Robbinson Griffons</p>
            </div>
          </div>
        </section>
      )}


      {stage === 13 && (
        <section className="scene movement-scene is-active">
          <div className="stacked-memory-heading">
            <span>Every memory comes together</span>
            <small>Watch them find their place.</small>
          </div>
          <div className="moving-photos">
            {heartPhotos.map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                className="moving-photo"
                style={{
                  '--offset-x': `${(index % 4) * 140 - 210}px`,
                  '--offset-y': `${(index % 3) * 120 - 160}px`,
                  '--rotation': `${-8 + (index * 7)}deg`,
                  animationDelay: `${index * 250}ms`,
                }}
              >
                <img src={photo} alt="Memory" />
              </div>
            ))}
          </div>
        </section>
      )}

      {stage === 16 && (
        <section className="scene final-message-scene is-active">
          <div className="final-heart-wrap">
            <div className="final-heart">
              {heartPhotos.map((photo, index) => (
                <div
                  key={`${photo}-final-${index}`}
                  className="heart-photo final"
                  style={{
                    left: `${15 + (index % 4) * 18}%`,
                    top: `${14 + Math.floor(index / 4) * 26}%`,
                    animationDelay: `${index * 200}ms`,
                  }}
                >
                  <img src={photo} alt="Final memory" />
                </div>
              ))}
            </div>
          </div>
          <div className="final-text-block">
            <h1>HAPPY 20TH BIRTHDAY</h1>
            <h2>MY LOVE <span className="heart-mark" aria-label="love" /></h2>
          </div>
        </section>
      )}

      {stage === 17 && (
        <section className="scene last-line-scene is-active">
          <div className="last-line">"Here's to 20..."</div>
          <div className="last-line second">"...and everything still to come."</div>
        </section>
      )}

      {stage === 18 && (
        <section className="scene end-scene is-active">
          <div className="end-name">My Love <span className="heart-mark" aria-label="love" /></div>
          {secretUnlocked && (
            <button type="button" className="secret-heart" onClick={() => setSecretUnlocked('message')}>
              <span className="heart-mark" aria-label="secret love" />
            </button>
          )}
          {secretUnlocked === 'message' && (
            <div className="secret-message">
              <p>Okay... one more thing.</p>
              <p>I love you.</p>
            </div>
          )}
        </section>
      )}

      {stage === 19 && (
        <section className="scene black-screen is-active">
          <div className="end-name dim">My Love <span className="heart-mark" aria-label="love" /></div>
        </section>
      )}
    </main>
  );
}

export default App;
