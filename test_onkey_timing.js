// Test the improved onKey timing fix
import { TypingEngine } from './dist/index.es.js';

const keyEvents = [];
const completionEvents = [];

const engine = new TypingEngine('Relax', {
  speed: 50,
  mistakeFrequency: 0,
  debug: true,
  onKey: (keyInfo) => {
    const timestamp = Date.now();
    keyEvents.push({
      key: keyInfo.key,
      timestamp,
      type: 'onKey'
    });
    console.log(`🔑 onKey: "${keyInfo.key}" at ${timestamp}`);
  }
});

engine.onCompleteListener(() => {
  const timestamp = Date.now();
  completionEvents.push({ timestamp, type: 'completion' });
  console.log(`🎉 onComplete at ${timestamp}`);
  
  console.log('\n=== TIMING ANALYSIS ===');
  console.log(`Total onKey events: ${keyEvents.length}`);
  console.log(`Final character events for 'x':`);
  
  const finalXKeys = keyEvents.filter(e => e.key.toLowerCase() === 'x');
  finalXKeys.forEach(e => console.log(`  - Key '${e.key}' at ${e.timestamp}`));
  
  if (completionEvents.length > 0) {
    const completionTime = completionEvents[0].timestamp;
    const keysAfterCompletion = keyEvents.filter(e => e.timestamp > completionTime);
    
    console.log(`Keys fired AFTER completion: ${keysAfterCompletion.length}`);
    if (keysAfterCompletion.length > 0) {
      console.log('❌ ISSUE: Keys fired after completion');
      keysAfterCompletion.forEach(e => console.log(`  - ${e.key} at ${e.timestamp}`));
    } else {
      console.log('✅ SUCCESS: All keys fired before completion');
    }
  }
  
  process.exit(0);
});

console.log('Starting enhanced timing test...');
engine.start();

setTimeout(() => {
  console.log('Test timeout - something went wrong');
  process.exit(1);
}, 10000);