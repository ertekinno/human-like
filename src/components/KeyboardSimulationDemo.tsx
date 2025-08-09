import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useHumanLike } from '../hooks/useHumanLike';
import { MobileKeyboard } from './MobileKeyboard';
import { DesktopKeyboard } from './DesktopKeyboard';
import { useKeyPressIndicator } from './KeyPressIndicator';
import { KeyboardView } from '../types';
import type { HumanLikeConfig } from '../types';

interface KeyboardSimulationDemoProps {
  text?: string;
  speed?: number;
  mistakeFrequency?: number;
  keyboardMode?: 'mobile' | 'desktop';
  theme?: 'light' | 'dark';
  autoStart?: boolean;
}

export const KeyboardSimulationDemo: React.FC<KeyboardSimulationDemoProps> = ({
  text: propText,
  speed: propSpeed,
  mistakeFrequency: propMistakeFrequency,
  keyboardMode: propKeyboardMode,
  theme: propTheme,
  autoStart = false
}) => {
  const defaultText = "HELLO World! Check out these amazing symbols: @#$%^&*() and numbers 12345. This demonstrates natural keyboard timing with view switching on mobile keyboards! 🚀";
  const [customText, setCustomText] = useState(propText || defaultText);
  const [currentText, setCurrentText] = useState(propText || customText);
  const [keyboardMode, setKeyboardMode] = useState<'mobile' | 'desktop'>(propKeyboardMode || 'mobile');
  const [currentView, setCurrentView] = useState<KeyboardView>(KeyboardView.Letters);
  const [theme, setTheme] = useState<'light' | 'dark'>(propTheme || 'light');
  const [highlightedKey, setHighlightedKey] = useState<string>('');
  
  const { keyHistory, addKeyPress, clearHistory } = useKeyPressIndicator();
  
  // Sync with external prop changes only if props are provided
  useEffect(() => {
    if (propTheme && propTheme !== theme) {
      setTheme(propTheme);
    }
  }, [propTheme, theme]);
  
  useEffect(() => {
    if (propKeyboardMode && propKeyboardMode !== keyboardMode) {
      setKeyboardMode(propKeyboardMode);
    }
  }, [propKeyboardMode, keyboardMode]);
  
  useEffect(() => {
    if (propText && propText !== currentText) {
      setCurrentText(propText);
      setCustomText(propText);
    }
  }, [propText, currentText]);
  
  const [config, setConfig] = useState<Partial<HumanLikeConfig>>({
    speed: propSpeed || 60,  // Good average speed (~100 WPM)
    speedVariation: 20,
    mistakeFrequency: propMistakeFrequency || 0.02,
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

  const [cursorConfig, setCursorConfig] = useState({
    showCursor: true,
    cursorChar: '|',
    cursorBlinkSpeed: 530
  });


  const handleKeyPress = useCallback((keyInfo: any) => {
    // keyInfo is already a complete KeyInfo object from the typing engine
    console.log(`🔑 Key: ${keyInfo.key}, Type: ${keyInfo.type}, View: ${keyInfo.keyboardView}, Duration: ${keyInfo.duration}ms, Sequence: ${keyInfo.sequenceIndex + 1}/${keyInfo.sequenceLength}`);
    
    // Highlight the key being pressed
    setHighlightedKey(keyInfo.key);
    
    // Clear highlight after duration
    setTimeout(() => {
      setHighlightedKey('');
    }, keyInfo.duration);
    
    // Update keyboard view based on key press (only for valid views)
    const view = keyInfo.keyboardView;
    if (view === 'letters') setCurrentView(KeyboardView.Letters);
    else if (view === 'numbers') setCurrentView(KeyboardView.Numbers);
    else if (view === 'symbols') setCurrentView(KeyboardView.Symbols);
    
    // Add the complete KeyInfo to key press history (no reconstruction needed)
    addKeyPress(keyInfo);
  }, [addKeyPress]);

  const {
    displayText,
    showCursor,
    cursorChar,
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
    showCursor: cursorConfig.showCursor,
    cursorChar: cursorConfig.cursorChar,
    cursorBlinkSpeed: cursorConfig.cursorBlinkSpeed,
    autoStart,
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
    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    borderRadius: '8px',
    border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
    width: '100%',
    minWidth: '800px'
  };


  const controlsStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    justifyContent: 'start',
    marginBottom: '16px'
  };

  const buttonStyle = (variant: 'primary' | 'secondary' = 'secondary') => ({
    padding: '8px 16px',
    border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: variant === 'primary' 
      ? '#007aff'
      : (theme === 'dark' ? '#404040' : '#f8f8f8'),
    color: variant === 'primary' 
      ? '#ffffff' 
      : (theme === 'dark' ? '#ffffff' : '#000000')
  });


  const typingAreaStyle = {
    backgroundColor: theme === 'dark' ? '#1c1c1c' : '#f2f2f2',
    borderRadius: '8px',
    padding: '25px',
    width: '100%',
    minHeight: '120px',
    textAlign: 'left' as const,
    fontSize: '18px',
    lineHeight: '1.6',
    fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
    border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
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
    backgroundColor: theme === 'dark' ? '#1c1c1c' : '#f2f2f2',
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


  return (
    <div style={containerStyle}>

      {/* Keyboard Mode Selection */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          display: 'block',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          textAlign: 'left'
        }}>
          Keyboard Mode:
        </label>
        <div style={controlsStyle}>
          <button 
            style={buttonStyle(keyboardMode === 'mobile' ? 'primary' : 'secondary')}
            onClick={() => {
              setKeyboardMode('mobile');
              setConfig(prev => ({ ...prev, keyboardMode: 'mobile' }));
              reset();
            }}
          >
            Mobile
          </button>
          <button 
            style={buttonStyle(keyboardMode === 'desktop' ? 'primary' : 'secondary')}
            onClick={() => {
              setKeyboardMode('desktop');
              setConfig(prev => ({ ...prev, keyboardMode: 'desktop' }));
              reset();
            }}
          >
            Desktop
          </button>
        </div>
      </div>

      {/* Playback Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          display: 'block',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          textAlign: 'left'
        }}>
          Playback Controls:
        </label>
        <div style={controlsStyle}>
          <button style={buttonStyle('primary')} onClick={start}>Start</button>
          <button style={buttonStyle()} onClick={pause}>Pause</button>
          <button style={buttonStyle()} onClick={resume}>Resume</button>
          <button style={buttonStyle()} onClick={stop}>Stop</button>
          <button style={buttonStyle()} onClick={reset}>Reset</button>
          <button style={buttonStyle()} onClick={skip}>Skip</button>
        </div>
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginBottom: '24px' }}>

      {/* Typing Area */}
      <div style={typingAreaStyle}>
        {displayText}
        {showCursor && (
          <span style={{ 
            opacity: 0.7, 
            marginLeft: '2px',
          }}>{cursorChar}</span>
        )}
      </div>

      
      {/* Key Press History */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#404040' : '#f8f8f8',
        borderRadius: '8px',
        padding: '16px',
        border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
        height: '320px',
        minWidth: '240px',
        overflowY: 'auto'
      }}>
        
        {keyHistory.length === 0 ? (
          <div style={{
            textAlign: 'left',
            color: theme === 'dark' ? '#999999' : '#666666',
            fontSize: '14px'
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
                enter: '#8E8E93',
                backspace: '#FF3B30'
              };
              return colors[type as keyof typeof colors] || '#999999';
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
                  backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff',
                  borderRadius: '6px',
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
                    {(() => {
                      // Format key name based on type
                      const key = keyInfo.key;
                      const type = keyInfo.type;
                      
                      if (type === 'view-switch') return key.toUpperCase();
                      if (key === 'space') return 'SPACE';
                      if (key === 'enter' || key === 'return') return 'ENTER';
                      if (key === 'shift') return 'SHIFT';
                      if (key === 'caps lock' || key === 'CAPS') return 'CAPS LOCK';
                      if (key === 'backspace' || key === '⌫') return 'BACKSPACE';
                      if (key === '.?123' || key === 'numbers') return '123';
                      if (key === '#+=' || key === 'symbols') return '#+=';
                      if (key === 'ABC' || key === 'letters') return 'ABC';
                      
                      return key.toUpperCase();
                    })()}
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

      {/* Virtual Keyboard */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        {keyboardMode === 'mobile' ? (
          <MobileKeyboard
            currentView={currentView}
            highlightedKey={highlightedKey}
            keyboardMode={theme}
            onViewChange={(event) => {
              setCurrentView(event.currentView);
            }}
            onKeyPress={(key) => {
              setHighlightedKey(key);
              setTimeout(() => setHighlightedKey(''), 200);
            }}
            style={{ maxWidth: 'none' }}
          />
        ) : (
          <DesktopKeyboard
            highlightedKey={highlightedKey}
            keyboardMode={theme}
            onKeyPress={(key) => {
              setHighlightedKey(key);
              setTimeout(() => setHighlightedKey(''), 200);
            }}
          />
        )}
      </div>


      {/* 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Sample Texts */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#404040' : '#f8f8f8',
          borderRadius: '8px',
          padding: '16px',
          border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
          textAlign: 'left'
        }}>
          <h4 style={{ marginTop: '0px', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
            Sample Texts
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            {Object.entries(sampleTexts).map(([key, text]) => (
              <button
                key={key}
                style={{
                  ...buttonStyle(),
                  fontSize: '13px',
                  padding: '10px 12px',
                  textAlign: 'left'
                }}
                onClick={() => {
                  setCurrentText(text);
                  setCustomText(text);
                  reset();
                }}
                title={text.substring(0, 100) + '...'}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {/* Custom Text Input */}
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
              Custom Text
            </h4>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                borderRadius: '6px',
                border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
                backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontSize: '14px',
                fontFamily: 'SF Mono, Monaco, monospace',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your custom text here..."
            />
            <button
              style={{
                ...buttonStyle('primary'),
                marginTop: '12px',
                width: '100%',
                fontSize: '14px',
                fontWeight: '600'
              }}
              onClick={() => {
                setCurrentText(customText);
                reset();
              }}
            >
              Update Text
            </button>
          </div>
        </div>

        {/* Right Column: Configuration */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#404040' : '#f8f8f8',
          borderRadius: '8px',
          padding: '16px',
          border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Basic Settings */}
            <div>
              <h4 style={{ marginTop: '0px', marginBottom: '12px', fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>
                Basic Settings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
                    Speed: {config.speed || 60}ms
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={config.speed || 60}
                    onChange={(e) => setConfig(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                    style={{ width: '100%', height: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
                    Speed Variation: {config.speedVariation}ms
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.speedVariation}
                    onChange={(e) => setConfig(prev => ({ ...prev, speedVariation: parseInt(e.target.value) }))}
                    style={{ width: '100%', height: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
                    Mistake Rate: {((config.mistakeFrequency || 0) * 100).toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={config.mistakeFrequency || 0}
                    onChange={(e) => setConfig(prev => ({ ...prev, mistakeFrequency: parseFloat(e.target.value) }))}
                    style={{ width: '100%', height: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Pause Timing Section */}
            <div style={{ paddingTop: '6px', borderTop: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>
                Pause Timing
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
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
                    style={{ width: '100%', height: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
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
                    style={{ width: '100%', height: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
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
                    style={{ width: '100%', height: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
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
                    style={{ width: '100%', height: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Mistake Types and Effects */}
            <div style={{ paddingTop: '6px', borderTop: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>
                Mistake Types & Effects
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
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
                  Adjacent Keys
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
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
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
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
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={config.fatigueEffect || false}
                    onChange={(e) => setConfig(prev => ({ ...prev, fatigueEffect: e.target.checked }))}
                  />
                  Fatigue Effect
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={config.concentrationLapses || false}
                    onChange={(e) => setConfig(prev => ({ ...prev, concentrationLapses: e.target.checked }))}
                  />
                  Concentration Lapses
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={config.overcorrection || false}
                    onChange={(e) => setConfig(prev => ({ ...prev, overcorrection: e.target.checked }))}
                  />
                  Overcorrection
                </label>
              </div>
            </div>

            {/* Cursor Settings Section */}
            <div style={{ paddingTop: '6px', borderTop: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>
                Cursor Settings
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={cursorConfig.showCursor}
                    onChange={(e) => setCursorConfig(prev => ({ ...prev, showCursor: e.target.checked }))}
                  />
                  Show Cursor
                </label>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
                    Cursor Character:
                  </label>
                  <input
                    type="text"
                    value={cursorConfig.cursorChar}
                    onChange={(e) => setCursorConfig(prev => ({ ...prev, cursorChar: e.target.value || '|' }))}
                    style={{
                      width: '60px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: theme === 'dark' ? '1px solid #555555' : '1px solid #cccccc',
                      backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffffff',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      textAlign: 'center'
                    }}
                    maxLength={2}
                    placeholder="|"
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px', display: 'block' }}>
                    Blink Speed: {cursorConfig.cursorBlinkSpeed}ms
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={cursorConfig.cursorBlinkSpeed}
                    onChange={(e) => setCursorConfig(prev => ({ ...prev, cursorBlinkSpeed: parseInt(e.target.value) }))}
                    style={{ width: '100%', height: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Settings Button */}
            <div style={{ paddingTop: '16px' }}>
              <button
                style={{
                  ...buttonStyle('primary'),
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '12px 16px'
                }}
                onClick={() => {
                  // Configuration changes are applied in real-time via state
                  // This button could trigger a reset or restart if needed
                  reset();
                }}
              >
                Apply Settings & Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};