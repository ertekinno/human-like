import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { useHumanLike } from './index';
import type { HumanLikeConfig } from './types';

// Configurable Demo Component
const ConfigurableDemo: React.FC = () => {
  const [customText, setCustomText] = useState("Experience the magic of Human-Like typewriter effect! This sophisticated library simulates realistic human typing behavior with intelligent mistakes, natural timing patterns, and advanced correction mechanics. Adjust the settings below to customize the typing experience and see how different configurations affect the realism of the animation.");
  const [currentText, setCurrentText] = useState(customText);

  const [config, setConfig] = useState<Partial<HumanLikeConfig>>({
    speed: 60,
    speedVariation: 30,
    mistakeFrequency: 0.03,
    mistakeTypes: {
      adjacent: true,
      random: false,
      doubleChar: true,
      commonTypos: true
    },
    fatigueEffect: false,
    concentrationLapses: false,
    overcorrection: true,
    sentencePause: 400,
    wordPause: 120,
    thinkingPause: 300
  });

  const [cursorConfig, setCursorConfig] = useState({
    showCursor: true,
    cursorChar: '|',
    cursorBlinkSpeed: 530
  });

  const {
    displayText,
    showCursor,
    cursorChar,
    currentState,
    progress,
    currentWPM,
    mistakeCount,
    totalDuration,
    start,
    stop,
    pause,
    resume,
    skip,
    reset
  } = useHumanLike({
    text: currentText,
    config,
    showCursor: cursorConfig.showCursor,
    cursorChar: cursorConfig.cursorChar,
    cursorBlinkSpeed: cursorConfig.cursorBlinkSpeed,
    autoStart: false,
    onStart: () => console.log('Configurable demo started'),
    onComplete: () => console.log('Configurable demo completed'),
    onMistake: (mistake) => console.log(`Mistake: "${mistake.originalChar}" → "${mistake.mistakeChar}" (${mistake.type}) at position ${mistake.position}`),
    onBackspace: () => console.log('Backspace correction'),
    onChar: (char, index) => {
      // Optimize rendering by reducing DOM updates
      if (index % 5 === 0 || char === ' ') {
        // Update less frequently to prevent flickering
      }
    }
  });

  // Apply configuration from UI controls
  const applySettings = useCallback(() => {
    const getElementValue = (id: string, defaultValue: number = 0) => {
      const element = document.getElementById(id) as HTMLInputElement;
      return element ? parseFloat(element.value) : defaultValue;
    };

    const getCheckboxValue = (id: string) => {
      const element = document.getElementById(id) as HTMLInputElement;
      return element ? element.checked : false;
    };

    const getTextValue = (id: string, defaultValue: string = '') => {
      const element = document.getElementById(id) as HTMLInputElement;
      return element ? element.value : defaultValue;
    };

    const newConfig: Partial<HumanLikeConfig> = {
      speed: getElementValue('speed1', 60),
      speedVariation: getElementValue('variation1', 30),
      mistakeFrequency: getElementValue('mistakes1', 3) / 100, // Convert percentage
      mistakeTypes: {
        adjacent: getCheckboxValue('adjacent1'),
        random: false,
        doubleChar: getCheckboxValue('double1'),
        commonTypos: getCheckboxValue('typos1')
      },
      fatigueEffect: getCheckboxValue('fatigue1'),
      concentrationLapses: getCheckboxValue('concentration1'),
      overcorrection: getCheckboxValue('overcorrection1'),
      sentencePause: getElementValue('sentence1', 400),
      wordPause: getElementValue('word1', 120),
      thinkingPause: getElementValue('thinking1', 300)
    };

    const newCursorConfig = {
      showCursor: getCheckboxValue('show-cursor'),
      cursorChar: getTextValue('cursor-char', '|') || '|', // Fallback to default if empty
      cursorBlinkSpeed: getElementValue('cursor-blink', 530)
    };

    setConfig(newConfig);
    setCursorConfig(newCursorConfig);
    
    // Update text if it changed
    const textValue = getTextValue('custom-text', currentText);
    if (textValue !== currentText) {
      setCurrentText(textValue);
    }
    
    reset(); // Reset to apply new config
  }, [reset, currentText]);

  // Setup event handlers
  useEffect(() => {
    const setupButton = (id: string, handler: () => void) => {
      const button = document.getElementById(id);
      if (button) {
        button.onclick = handler;
      }
    };

    // Control buttons
    setupButton('start1', start);
    setupButton('stop1', stop);
    setupButton('pause1', pause);
    setupButton('resume1', resume);
    setupButton('skip1', skip);
    setupButton('reset1', reset);
    setupButton('apply1', applySettings);
    setupButton('update-text', () => {
      const element = document.getElementById('custom-text') as HTMLTextAreaElement;
      if (element && element.value !== currentText) {
        setCustomText(element.value);
        setCurrentText(element.value);
        reset();
      }
    });
    
    // Sample text buttons
    setupButton('sample-basic', () => {
      const element = document.getElementById('custom-text') as HTMLTextAreaElement;
      if (element) {
        element.value = "Hello! This is a simple test with numbers 123 and symbols @#$%.";
        setCustomText(element.value);
        setCurrentText(element.value);
        reset();
      }
    });
    
    setupButton('sample-complex', () => {
      const element = document.getElementById('custom-text') as HTMLTextAreaElement;
      if (element) {
        element.value = "ADVANCED Testing: Capital Letters, Numbers 0-9, Complex Symbols (@#$%^&*), and common words like 'the', 'and', 'programming'. This text demonstrates ALL enhanced features including look-ahead typing patterns!";
        setCustomText(element.value);
        setCurrentText(element.value);
        reset();
      }
    });
    
    setupButton('sample-coding', () => {
      const element = document.getElementById('custom-text') as HTMLTextAreaElement;
      if (element) {
        element.value = 'const myFunction = (data: string[]) => {\n  return data.filter(item => item.length > 0)\n    .map(item => `Hello ${item}!`)\n    .join(", ");\n};';
        setCustomText(element.value);
        setCurrentText(element.value);
        reset();
      }
    });
    
    setupButton('sample-multiline', () => {
      const element = document.getElementById('custom-text') as HTMLTextAreaElement;
      if (element) {
        element.value = 'Multi-line Text Support!\n\nThis demonstrates how the Human-Like library handles:\n• Line breaks and paragraphs\n• Capital Letters and CAPS LOCK behavior\n• Numbers: 123, 456, 789\n• Symbols: @#$%^&*()\n\nEach line break gets a realistic 800ms pause,\njust like when someone presses Enter!';
        setCustomText(element.value);
        setCurrentText(element.value);
        reset();
      }
    });
    
    setupButton('sample-caps', () => {
      const element = document.getElementById('custom-text') as HTMLTextAreaElement;
      if (element) {
        element.value = 'CAPS LOCK Intelligence Demo!\n\nShift Mode: A B C (each +100ms)\nCAPS LOCK Mode: HELLO WORLD TESTING MULTIPLE WORDS (only first H +150ms, all middle normal, only last S +100ms)\nMixed: Hello WORLD Again NEW FEATURE Works!\n\nWatch console for detailed timing logs!';
        setCustomText(element.value);
        setCurrentText(element.value);
        reset();
      }
    });

    // Sync slider and number inputs
    const setupSliderSync = (baseId: string) => {
      const slider = document.getElementById(baseId) as HTMLInputElement;
      const numberInput = document.getElementById(`${baseId}-num`) as HTMLInputElement;
      
      if (slider && numberInput) {
        slider.oninput = () => {
          numberInput.value = slider.value;
        };
        numberInput.oninput = () => {
          slider.value = numberInput.value;
        };
      }
    };

    setupSliderSync('speed1');
    setupSliderSync('variation1');
    setupSliderSync('mistakes1');
    setupSliderSync('sentence1');
    setupSliderSync('word1');
    setupSliderSync('thinking1');
    setupSliderSync('cursor-blink');

  }, [start, stop, pause, resume, skip, reset, applySettings]);

  // Update stats with throttling to prevent excessive updates
  useEffect(() => {
    const statsElement = document.getElementById('stats1');
    if (statsElement) {
      const formatDuration = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`;
      
      statsElement.innerHTML = `
        State: <strong>${currentState}</strong> | 
        Progress: <strong>${progress.toFixed(1)}%</strong> | 
        WPM: <strong>${currentWPM}</strong> | 
        Mistakes: <strong>${mistakeCount}</strong> |
        Speed: <strong>${config.speed}ms</strong> |
        Duration: <strong>${formatDuration(totalDuration)}</strong>
      `;
    }
  }, [currentState, progress, currentWPM, mistakeCount, totalDuration, config.speed]);

  return (
    <span style={{ 
      fontFamily: 'monospace',
      fontSize: '1rem',
      lineHeight: '1.6',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap'
    }}>
      {displayText}
      {showCursor && (
        <span style={{ 
          animation: 'human-like-cursor-blink 1.06s infinite',
          fontWeight: 'bold'
        }}>{cursorChar}</span>
      )}
    </span>
  );
};

// Preset Demo Component
const PresetDemo: React.FC = () => {
  const text = "This ENHANCED demo showcases NEW features: Capital Letters, Numbers 123, Complex Symbols @#$%, and Look-ahead typing patterns. Test different configurations to see realistic human typing behavior with advanced mistake patterns and timing variations!";

  const [currentConfig, setCurrentConfig] = useState<Partial<HumanLikeConfig>>({
    speed: 60,
    mistakeFrequency: 0.03
  });

  const {
    displayText,
    showCursor,
    cursorChar,
    currentState,
    progress,
    currentWPM,
    mistakeCount,
    totalDuration,
    start,
    stop,
    reset
  } = useHumanLike({
    text,
    config: currentConfig,
    autoStart: false,
    onMistake: (mistake) => console.log(`Preset mistake: "${mistake.originalChar}" → "${mistake.mistakeChar}" (${mistake.type}) at position ${mistake.position}`),
    onBackspace: () => console.log('Preset backspace correction')
  });

  const presets = {
    slow: {
      speed: 120,
      speedVariation: 40,
      mistakeFrequency: 0.02,
      sentencePause: 800,
      wordPause: 200,
      fatigueEffect: true
    },
    normal: {
      speed: 60,
      speedVariation: 30,
      mistakeFrequency: 0.03,
      sentencePause: 400,
      wordPause: 120,
      fatigueEffect: false
    },
    fast: {
      speed: 25,
      speedVariation: 15,
      mistakeFrequency: 0.01,
      sentencePause: 150,
      wordPause: 50,
      fatigueEffect: false,
      concentrationLapses: false
    },
    mistakes: {
      speed: 50,
      speedVariation: 35,
      mistakeFrequency: 0.08,
      mistakeTypes: {
        adjacent: true,
        random: true,
        doubleChar: true,
        commonTypos: true
      },
      overcorrection: true,
      concentrationLapses: true
    },
    doubleChar: {
      speed: 60,
      speedVariation: 20,
      mistakeFrequency: 0.15,
      mistakeTypes: {
        adjacent: false,
        random: false,
        doubleChar: true,  // Only double char mistakes
        commonTypos: false
      },
      overcorrection: false,
      concentrationLapses: false,
      sentencePause: 200,
      wordPause: 80
    },
    perfect: {
      speed: 45,
      speedVariation: 20,
      mistakeFrequency: 0,
      sentencePause: 300,
      wordPause: 80,
      fatigueEffect: false,
      concentrationLapses: false
    },
    enhanced: {
      speed: 65,
      speedVariation: 25,
      mistakeFrequency: 0.05,
      mistakeTypes: {
        adjacent: true,
        random: false,
        doubleChar: true,
        commonTypos: true
      },
      fatigueEffect: true,
      concentrationLapses: true,
      overcorrection: true,
      sentencePause: 450,
      wordPause: 100,
      thinkingPause: 350
    }
  };

  const startPreset = useCallback((presetName: keyof typeof presets) => {
    setCurrentConfig(presets[presetName]);
    reset();
    setTimeout(start, 100); // Small delay to ensure config is applied
  }, [start, reset]);

  useEffect(() => {
    const setupButton = (id: string, handler: () => void) => {
      const button = document.getElementById(id);
      if (button) {
        button.onclick = handler;
      }
    };

    setupButton('slow-demo', () => startPreset('slow'));
    setupButton('normal-demo', () => startPreset('normal'));
    setupButton('fast-demo', () => startPreset('fast'));
    setupButton('mistakes-demo', () => startPreset('mistakes'));
    setupButton('doubleChar-demo', () => startPreset('doubleChar'));
    setupButton('perfect-demo', () => startPreset('perfect'));
    setupButton('enhanced-demo', () => startPreset('enhanced'));
    setupButton('stop2', stop);

  }, [startPreset, stop]);

  useEffect(() => {
    const statsElement = document.getElementById('stats2');
    if (statsElement) {
      const formatDuration = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`;
      
      statsElement.innerHTML = `
        State: <strong>${currentState}</strong> | 
        Progress: <strong>${progress.toFixed(1)}%</strong> | 
        WPM: <strong>${currentWPM}</strong> | 
        Mistakes: <strong>${mistakeCount}</strong> |
        Speed: <strong>${currentConfig.speed}ms</strong> |
        Duration: <strong>${formatDuration(totalDuration)}</strong>
      `;
    }
  }, [currentState, progress, currentWPM, mistakeCount, totalDuration, currentConfig.speed]);

  return (
    <span style={{ 
      fontFamily: 'monospace',
      fontSize: '1rem',
      lineHeight: '1.6',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap'
    }}>
      {displayText}
      {showCursor && (
        <span style={{ 
          animation: 'human-like-cursor-blink 1.06s infinite',
          fontWeight: 'bold'
        }}>{cursorChar}</span>
      )}
    </span>
  );
};

// Duration Demo Component
const DurationDemo: React.FC = () => {
  const [durationStartTime, setDurationStartTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [wasPaused, setWasPaused] = useState(false);
  
  const sampleTexts = {
    short: "Hello World!",
    medium: "This is a medium-length text to demonstrate duration tracking with realistic typing speed and timing.",
    long: "This is a comprehensive demonstration of the totalDuration feature. It includes various punctuation marks, numbers like 123 and 456, special characters @#$%, and realistic human typing patterns with potential mistakes and corrections. The duration tracker measures every aspect of the typing process including delays, pauses, mistakes, and corrections to provide accurate timing metrics for performance analysis and user experience optimization.",
    complex: "Advanced Test: CAPITAL Letters, Numbers 0-9, Symbols (@#$%^&*), and complex programming syntax like: const func = (data: string[]) => { return data.filter(x => x.length > 0); };",
    mistakes: "This text is specifically designed to trigger common typos and mistakes. Words like 'the', 'and', 'because', 'through', and 'different' often contain errors that need correction.",
    pause: "This demo will pause after a few words... [PAUSE] ...and then continue to show how paused time is excluded from the total duration calculation."
  };

  const [currentText, setCurrentText] = useState(sampleTexts.short);
  const [textType, setTextType] = useState<keyof typeof sampleTexts>('short');

  const {
    displayText,
    showCursor,
    cursorChar,
    currentState,
    progress,
    currentWPM,
    mistakeCount,
    totalDuration,
    isCompleted,
    start,
    stop,
    pause,
    resume,
    reset
  } = useHumanLike({
    text: currentText,
    config: {
      speed: textType === 'mistakes' ? 60 : 50,
      speedVariation: 25,
      mistakeFrequency: textType === 'mistakes' ? 0.12 : 0.04, 
      mistakeTypes: {
        adjacent: true,
        random: false,
        doubleChar: true,
        commonTypos: true
      },
      fatigueEffect: textType === 'long',
      concentrationLapses: textType === 'complex',
      overcorrection: true,
      sentencePause: 300,
      wordPause: 100,
      thinkingPause: 250
    },
    autoStart: false,
    onStart: () => {
      console.log('Duration demo started');
      setDurationStartTime(Date.now());
      setPausedTime(0);
      setWasPaused(false);
    },
    onComplete: () => {
      console.log(`Duration demo completed in ${totalDuration}ms`);
    },
    onPause: () => {
      setWasPaused(true);
    },
    onResume: () => {
      // Resume tracking will be handled by the engine
    }
  });

  const startDemo = useCallback((type: keyof typeof sampleTexts) => {
    setTextType(type);
    setCurrentText(sampleTexts[type]);
    setTimeout(() => {
      reset();
      setTimeout(start, 100);
    }, 50);
  }, [start, reset]);

  const handlePauseTest = useCallback(() => {
    startDemo('pause');
    // Auto-pause after 2 seconds
    setTimeout(() => {
      if (currentState === 'typing') {
        pause();
        // Auto-resume after 3 seconds
        setTimeout(resume, 3000);
      }
    }, 2000);
  }, [startDemo, pause, resume, currentState]);

  useEffect(() => {
    const setupButton = (id: string, handler: () => void) => {
      const button = document.getElementById(id);
      if (button) {
        button.onclick = handler;
      }
    };

    setupButton('duration-short', () => startDemo('short'));
    setupButton('duration-medium', () => startDemo('medium'));
    setupButton('duration-long', () => startDemo('long'));
    setupButton('duration-complex', () => startDemo('complex'));
    setupButton('duration-mistakes', () => startDemo('mistakes'));
    setupButton('duration-pause', handlePauseTest);
    setupButton('stop-duration', stop);
    setupButton('reset-duration', reset);

  }, [startDemo, handlePauseTest, stop, reset]);

  // Calculate derived metrics
  const elapsedTime = durationStartTime > 0 ? Date.now() - durationStartTime : 0;
  const charsPerSecond = totalDuration > 0 ? (displayText.length / (totalDuration / 1000)) : 0;
  const accuracy = mistakeCount > 0 && displayText.length > 0 ? 
    ((displayText.length / (displayText.length + mistakeCount)) * 100) : 100;

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  };

  // Update stats display
  useEffect(() => {
    const updateElement = (id: string, value: string) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    updateElement('total-duration', formatDuration(totalDuration));
    updateElement('elapsed-duration', formatDuration(elapsedTime));
    updateElement('paused-duration', formatDuration(elapsedTime - totalDuration));
    updateElement('current-wpm', `${currentWPM} WPM`);
    updateElement('mistake-count', mistakeCount.toString());
    updateElement('typing-state', currentState);
    updateElement('chars-per-second', charsPerSecond.toFixed(1));
    updateElement('accuracy-rate', `${accuracy.toFixed(1)}%`);
    updateElement('progress-percent', `${progress.toFixed(1)}%`);
  }, [totalDuration, elapsedTime, currentWPM, mistakeCount, currentState, charsPerSecond, accuracy, progress]);

  return (
    <span style={{ 
      fontFamily: 'monospace',
      fontSize: '1rem',
      lineHeight: '1.6',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap'
    }}>
      {displayText}
      {showCursor && (
        <span style={{ 
          animation: 'human-like-cursor-blink 1.06s infinite',
          fontWeight: 'bold'
        }}>{cursorChar}</span>
      )}
    </span>
  );
};

// Initialize demos
function initializeDemos() {
  try {
    // Demo 1 - Configurable
    const demo1Element = document.getElementById('demo1');
    if (demo1Element) {
      const root1 = ReactDOM.createRoot(demo1Element);
      root1.render(<ConfigurableDemo />);
    }

    // Demo Duration - TotalDuration tracking
    const demoDurationElement = document.getElementById('demo-duration');
    if (demoDurationElement) {
      const rootDuration = ReactDOM.createRoot(demoDurationElement);
      rootDuration.render(<DurationDemo />);
    }

    // Demo 2 - Presets
    const demo2Element = document.getElementById('demo2');
    if (demo2Element) {
      const root2 = ReactDOM.createRoot(demo2Element);
      root2.render(<PresetDemo />);
    }
  } catch (error) {
    console.error('Failed to initialize demos:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDemos);
} else {
  initializeDemos();
}