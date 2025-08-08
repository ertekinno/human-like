import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useHumanLike } from '../hooks/useHumanLike';
import { MobileKeyboard } from './MobileKeyboard';
import { DesktopKeyboard } from './DesktopKeyboard';
import { useKeyPressIndicator } from './KeyPressIndicator';
import { KeyboardView } from '../types';
import type { HumanLikeConfig } from '../types';

export const KeyboardSimulationDemo: React.FC = () => {
  const [customText, setCustomText] = useState("HELLO World! Check out these amazing symbols: @#$%^&*() and numbers 12345. This demonstrates natural keyboard timing with view switching on mobile keyboards! 🚀");
  const [currentText, setCurrentText] = useState(customText);
  const [keyboardMode, setKeyboardMode] = useState<'mobile' | 'desktop'>('mobile');
  const [currentView, setCurrentView] = useState<KeyboardView>(KeyboardView.Letters);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [highlightedKey, setHighlightedKey] = useState<string>('');
  
  const { keyHistory, addKeyPress, clearHistory } = useKeyPressIndicator();
  
  const [config, setConfig] = useState<Partial<HumanLikeConfig>>({
    speed: 60,  // Good average speed (~100 WPM)
    speedVariation: 20,
    mistakeFrequency: 0.02,
    keyboardMode: 'mobile',
    mistakeTypes: {
      adjacent: true,
      random: false,
      doubleChar: true,
      commonTypos: true
    },
    fatigueEffect: false,
    concentrationLapses: false,
    overcorrection: true
  });

  const handleKeyPress = useCallback((event: any, id?: string) => {
    // Handle both old KeyInfo and new KeyPressEvent formats
    const key = event.key;
    const view = event.view || event.keyboardView || 'letters';
    const duration = event.duration || 200;
    
    console.log(`🔑 Key: ${key}, View: ${view}, ID: ${id}`);
    
    // Highlight the key being pressed
    setHighlightedKey(key);
    
    // Clear highlight after duration
    setTimeout(() => {
      setHighlightedKey('');
    }, duration);
    
    // Update keyboard view based on key press (only for valid views)
    if (view === 'letters') setCurrentView(KeyboardView.Letters);
    else if (view === 'numbers') setCurrentView(KeyboardView.Numbers);
    else if (view === 'symbols') setCurrentView(KeyboardView.Symbols);
    
    // Add to key press history - simulate full KeyInfo structure
    const keyInfo = {
      key,
      character: event.character || key,
      type: event.type || 'letter',
      keyboardView: view,
      isCapsLock: event.isCapsLock || false,
      duration,
      sequenceIndex: event.sequenceIndex || 0,
      sequenceLength: event.sequenceLength || 1,
      timestamp: Date.now()
    };
    addKeyPress(keyInfo as any); // Cast to any to avoid strict typing issues
  }, [addKeyPress]);

  const {
    displayText,
    currentState,
    progress,
    currentWPM,
    mistakeCount,
    start,
    stop,
    pause,
    resume,
    skip,
    reset
  } = useHumanLike({
    text: currentText,
    config: {
      ...config,
      keyboardMode
    },
    autoStart: false,
    keyboardMode,
    onKey: handleKeyPress,
    onStart: () => {
      clearHistory();
      console.log('🚀 Keyboard simulation demo started');
    },
    onComplete: () => console.log('✅ Demo completed'),
    onMistake: (mistake) => console.log(`❌ Mistake: "${mistake.originalChar}" → "${mistake.mistakeChar}"`),
    onChar: (char, index) => console.log(`📝 Character: "${char}" at position ${index}`)
  });

  // Auto-restart when configuration changes during active typing
  const prevConfigRef = useRef(config);
  useEffect(() => {
    const configChanged = JSON.stringify(prevConfigRef.current) !== JSON.stringify(config);
    if (configChanged && (currentState === 'typing' || currentState === 'correcting' || currentState === 'paused')) {
      console.log('🔄 Configuration changed during typing, restarting...');
      reset();
      // Small delay to ensure reset completes before restart
      setTimeout(() => {
        start();
      }, 100);
    }
    prevConfigRef.current = config;
  }, [config, currentState, reset, start]);

  // Sample texts for different scenarios
  const sampleTexts = {
    capsLock: "CAPS LOCK DEMO: THIS SHOWS CAPS LOCK BEHAVIOR vs Single Caps Like This!",
    symbols: "Symbol test: @username #hashtag $100 %discount ^power &and *star (parentheses) +plus =equals",
    numbers: "Numbers: 1234567890 and mixed content like user123@email.com",
    mixed: "Mixed content: Hello WORLD! Check symbols @#$% numbers 123 and normal text.",
    programming: "const greeting = 'Hello World!'; if (user.isActive) { console.log(`Welcome ${user.name}!`); }",
    sentences: "Short sentence. Another one! What about questions? This demonstrates sentence pauses after punctuation.",
    words: "This text has many individual words to demonstrate word pause timing between each word in the sentence.",
    complex: "Sophisticated terminology demonstrates thinking pauses before complex multisyllabic words like 'implementation', 'configuration', and 'demonstration'."
  };

  const containerStyle = {
    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    transition: 'all 0.3s ease'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '10px',
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const subtitleStyle = {
    fontSize: '18px',
    opacity: 0.8,
    marginBottom: '20px'
  };

  const controlsStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '30px'
  };

  const buttonStyle = (variant: 'primary' | 'secondary' = 'secondary') => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: variant === 'primary' 
      ? (theme === 'dark' ? '#007AFF' : '#007AFF')
      : (theme === 'dark' ? '#2c2c2e' : '#f2f2f7'),
    color: variant === 'primary' 
      ? '#ffffff' 
      : (theme === 'dark' ? '#ffffff' : '#000000'),
    ...(variant === 'secondary' && {
      border: `1px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}`
    })
  });

  const mainContentStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px'
  };

  const topSectionStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
    alignItems: 'start'
  };

  const leftColumnStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  };

  const typingAreaStyle = {
    backgroundColor: theme === 'dark' ? '#1c1c1e' : '#f2f2f7',
    borderRadius: '12px',
    padding: '25px',
    minHeight: '120px',
    fontSize: '18px',
    lineHeight: '1.6',
    fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
    border: `2px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}`,
    position: 'relative' as const,
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const
  };

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  };

  const statItemStyle = {
    backgroundColor: theme === 'dark' ? '#1c1c1e' : '#f2f2f7',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    border: `1px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}`
  };

  const statValueStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: theme === 'dark' ? '#007AFF' : '#007AFF'
  };

  const statLabelStyle = {
    fontSize: '12px',
    opacity: 0.7,
    textTransform: 'uppercase' as const,
    fontWeight: '600',
    marginTop: '5px'
  };

  const keyPressHistoryStyle = {
    backgroundColor: theme === 'dark' ? '#1c1c1e' : '#f2f2f7',
    borderRadius: '12px',
    padding: '20px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    border: `1px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}`
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🎹 Keyboard Simulation Demo</h1>
        <p style={subtitleStyle}>
          Watch real-time key presses with natural timing patterns
        </p>
        
        <div style={controlsStyle}>
          <button 
            style={buttonStyle(keyboardMode === 'mobile' ? 'primary' : 'secondary')}
            onClick={() => {
              setKeyboardMode('mobile');
              setConfig(prev => ({ ...prev, keyboardMode: 'mobile' }));
              reset();
            }}
          >
            📱 Mobile
          </button>
          <button 
            style={buttonStyle(keyboardMode === 'desktop' ? 'primary' : 'secondary')}
            onClick={() => {
              setKeyboardMode('desktop');
              setConfig(prev => ({ ...prev, keyboardMode: 'desktop' }));
              reset();
            }}
          >
            💻 Desktop
          </button>
          <button 
            style={buttonStyle(theme === 'dark' ? 'primary' : 'secondary')}
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'} Theme
          </button>
        </div>

        <div style={controlsStyle}>
          <button style={buttonStyle('primary')} onClick={start}>▶️ Start</button>
          <button style={buttonStyle()} onClick={pause}>⏸️ Pause</button>
          <button style={buttonStyle()} onClick={resume}>▶️ Resume</button>
          <button style={buttonStyle()} onClick={stop}>⏹️ Stop</button>
          <button style={buttonStyle()} onClick={reset}>🔄 Reset</button>
          <button style={buttonStyle()} onClick={skip}>⏭️ Skip</button>
        </div>
      </div>

      <div style={mainContentStyle}>
        <div style={topSectionStyle}>
          <div style={leftColumnStyle}>
            {/* Stats */}
            <div style={statsStyle}>
              <div style={statItemStyle}>
                <div style={statValueStyle}>{Math.round(progress)}%</div>
                <div style={statLabelStyle}>Progress</div>
              </div>
              <div style={statItemStyle}>
                <div style={statValueStyle}>{currentWPM}</div>
                <div style={statLabelStyle}>WPM</div>
              </div>
              <div style={statItemStyle}>
                <div style={statValueStyle}>{mistakeCount}</div>
                <div style={statLabelStyle}>Mistakes</div>
              </div>
              <div style={statItemStyle}>
                <div style={statValueStyle}>{currentState}</div>
                <div style={statLabelStyle}>State</div>
              </div>
            </div>

            {/* Typing Area */}
            <div style={typingAreaStyle}>
              {displayText}
              <span style={{ 
                opacity: 0.7, 
                animation: 'blink 1s infinite',
                marginLeft: '2px'
              }}>|</span>
            </div>

            {/* Sample Texts */}
            <div>
              <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                📝 Sample Texts
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {Object.entries(sampleTexts).map(([key, text]) => (
                  <button
                    key={key}
                    style={buttonStyle()}
                    onClick={() => {
                      setCurrentText(text);
                      setCustomText(text);
                      reset();
                    }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Press History */}
          <div style={keyPressHistoryStyle}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>
              🎹 Real-time Key Presses
            </h3>
            
            {keyHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: theme === 'dark' ? '#666666' : '#999999',
                fontSize: '14px',
                fontStyle: 'italic',
                padding: '20px'
              }}>
                Start typing to see key presses...
              </div>
            ) : (
              keyHistory.map((event, index) => {
                const keyInfo = event.keyInfo;
                const getKeyTypeColor = (type: string) => {
                  const colors = {
                    letter: '#34C759',
                    number: '#FF9F0A',
                    symbol: '#FF2D92',
                    modifier: '#007AFF',
                    'view-switch': '#AF52DE',
                    space: '#8E8E93',
                    enter: '#8E8E93'
                  };
                  return colors[type as keyof typeof colors] || '#999';
                };

                return (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      marginBottom: '6px',
                      backgroundColor: theme === 'dark' ? '#2c2c2e' : '#ffffff',
                      borderRadius: '8px',
                      border: `2px solid ${getKeyTypeColor(keyInfo.type)}`,
                      opacity: Math.max(0.3, 1 - (index * 0.1)),
                      transform: `scale(${Math.max(0.9, 1 - (index * 0.02))})`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: getKeyTypeColor(keyInfo.type),
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        marginRight: '8px'
                      }}>
                        {keyInfo.type}
                      </span>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        fontFamily: 'SF Mono, Monaco, monospace'
                      }}>
                        {keyInfo.key.toUpperCase()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      <div>{keyInfo.duration}ms</div>
                      <div style={{ fontSize: '10px' }}>
                        {keyInfo.sequenceIndex + 1}/{keyInfo.sequenceLength}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Virtual Keyboard - Now positioned below the typewriter */}
        <div style={{ width: '100%' }}>
          {keyboardMode === 'mobile' ? (
            <MobileKeyboard
              currentView={currentView}
              highlightedKey={highlightedKey}
              keyboardMode={theme}
            />
          ) : (
            <DesktopKeyboard
              highlightedKey={highlightedKey}
              keyboardMode={theme}
            />
          )}
        </div>

        {/* Configuration Controls */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1c1c1e' : '#f2f2f7',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}`
        }}>
          <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
            ⚙️ Configuration
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                Speed (ms/char): {config.speed || 60} 
                <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 'normal' }}>
                  {(config.speed || 60) <= 30 ? ' (Professional 300+ WPM)' :
                   (config.speed || 60) <= 50 ? ' (Fast 200+ WPM)' :
                   (config.speed || 60) <= 80 ? ' (Average 75-120 WPM)' :
                   (config.speed || 60) <= 150 ? ' (Slow 40-75 WPM)' :
                   (config.speed || 60) <= 300 ? ' (Beginner 20-40 WPM)' :
                   ' (Hunt & Peck <20 WPM)'}
                </span>
              </label>
              <input
                type="range"
                min="20"
                max="500"
                value={config.speed || 60}
                onChange={(e) => setConfig(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '10px', 
                opacity: 0.6, 
                marginTop: '2px' 
              }}>
                <span>20ms (Pro)</span>
                <span>80ms (Avg)</span>
                <span>300ms (Slow)</span>
                <span>500ms (Hunt & Peck)</span>
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                Speed Variation (±ms): {config.speedVariation}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={config.speedVariation}
                onChange={(e) => setConfig(prev => ({ ...prev, speedVariation: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                Mistake Rate (%): {((config.mistakeFrequency || 0) * 100).toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="0.15"
                step="0.005"
                value={config.mistakeFrequency || 0}
                onChange={(e) => setConfig(prev => ({ ...prev, mistakeFrequency: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Pause Configuration Section */}
          <div style={{ marginBottom: '20px', paddingTop: '15px', borderTop: `1px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}` }}>
            <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>
              ⏸️ Pause Timing (ms)
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Sentence Pause: {config.sentencePause || 500}ms
                  <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 'normal', display: 'block' }}>
                    After . ! ?
                  </span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={config.sentencePause || 500}
                  onChange={(e) => setConfig(prev => ({ ...prev, sentencePause: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  opacity: 0.6, 
                  marginTop: '2px' 
                }}>
                  <span>100ms</span>
                  <span>800ms</span>
                  <span>1500ms</span>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Word Pause: {config.wordPause || 150}ms
                  <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 'normal', display: 'block' }}>
                    Between words
                  </span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="25"
                  value={config.wordPause || 150}
                  onChange={(e) => setConfig(prev => ({ ...prev, wordPause: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  opacity: 0.6, 
                  marginTop: '2px' 
                }}>
                  <span>50ms</span>
                  <span>400ms</span>
                  <span>800ms</span>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Thinking Pause: {config.thinkingPause || 400}ms
                  <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 'normal', display: 'block' }}>
                    Before complex words
                  </span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={config.thinkingPause || 400}
                  onChange={(e) => setConfig(prev => ({ ...prev, thinkingPause: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  opacity: 0.6, 
                  marginTop: '2px' 
                }}>
                  <span>100ms</span>
                  <span>650ms</span>
                  <span>1200ms</span>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>
                  Correction Pause: {config.correctionPause || 200}ms
                  <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 'normal', display: 'block' }}>
                    Before fixing mistakes
                  </span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={config.correctionPause || 200}
                  onChange={(e) => setConfig(prev => ({ ...prev, correctionPause: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  opacity: 0.6, 
                  marginTop: '2px' 
                }}>
                  <span>50ms</span>
                  <span>525ms</span>
                  <span>1000ms</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={config.mistakeTypes?.adjacent || false}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  mistakeTypes: { 
                    adjacent: e.target.checked,
                    random: prev.mistakeTypes?.random || false,
                    doubleChar: prev.mistakeTypes?.doubleChar || false,
                    commonTypos: prev.mistakeTypes?.commonTypos || false
                  }
                }))}
              />
              Adjacent Key Mistakes
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={config.mistakeTypes?.doubleChar || false}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  mistakeTypes: { 
                    adjacent: prev.mistakeTypes?.adjacent || false,
                    random: prev.mistakeTypes?.random || false,
                    doubleChar: e.target.checked,
                    commonTypos: prev.mistakeTypes?.commonTypos || false
                  }
                }))}
              />
              Double Characters
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={config.mistakeTypes?.commonTypos || false}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  mistakeTypes: { 
                    adjacent: prev.mistakeTypes?.adjacent || false,
                    random: prev.mistakeTypes?.random || false,
                    doubleChar: prev.mistakeTypes?.doubleChar || false,
                    commonTypos: e.target.checked
                  }
                }))}
              />
              Common Typos
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={config.fatigueEffect || false}
                onChange={(e) => setConfig(prev => ({ ...prev, fatigueEffect: e.target.checked }))}
              />
              Fatigue Effect
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={config.concentrationLapses || false}
                onChange={(e) => setConfig(prev => ({ ...prev, concentrationLapses: e.target.checked }))}
              />
              Concentration Lapses
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={config.overcorrection || false}
                onChange={(e) => setConfig(prev => ({ ...prev, overcorrection: e.target.checked }))}
              />
              Overcorrection
            </label>
          </div>
        </div>

        {/* Custom Text Input */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1c1c1e' : '#f2f2f7',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}`
        }}>
          <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
            📝 Custom Text
          </h3>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            style={{
              width: '100%',
              height: '80px',
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${theme === 'dark' ? '#3c3c3e' : '#d1d1d6'}`,
              backgroundColor: theme === 'dark' ? '#2c2c2e' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: '14px',
              fontFamily: 'SF Mono, Monaco, monospace',
              resize: 'vertical'
            }}
            placeholder="Enter your custom text here..."
          />
          <button
            style={{
              ...buttonStyle('primary'),
              marginTop: '10px'
            }}
            onClick={() => {
              setCurrentText(customText);
              reset();
            }}
          >
            📝 Update Text
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};