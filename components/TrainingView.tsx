import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TrainingViewProps {
  onComplete: () => void;
}

const TrainingView: React.FC<TrainingViewProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [lossData, setLossData] = useState<{ step: number; loss: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let step = 0;
    const maxSteps = 50;
    
    const interval = setInterval(() => {
      step++;
      const currentProgress = (step / maxSteps) * 100;
      setProgress(currentProgress);

      // Simulate Loss decreasing
      const randomFluctuation = Math.random() * 0.1;
      const simulatedLoss = Math.max(0.01, 2.5 * Math.exp(-0.1 * step) + randomFluctuation);
      
      setLossData(prev => [...prev, { step, loss: simulatedLoss }]);

      // Generate fake log messages
      const messages = [
        `Epoch ${Math.ceil(step / 5)}/${maxSteps/5} | Batch ${step*12} | LR: 0.001`,
        `[GPU-0] Optimizing gradients... Loss: ${simulatedLoss.toFixed(4)}`,
        `[ResNet-X] Updating tensor weights...`,
        `Validating batch integrity... OK`,
        `Applying Backpropagation...`,
        `Analyzing Feature Map consistency...`
      ];
      
      setLogs(prev => [...prev, messages[Math.floor(Math.random() * messages.length)]]);

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

      if (step >= maxSteps) {
        clearInterval(interval);
        setLogs(prev => [...prev, "TRAINING COMPLETE. WEIGHTS UPDATED.", "SYSTEM READY."]);
        setTimeout(onComplete, 1500);
      }
    }, 150); // Speed of training simulation

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto h-[600px] bg-black border border-green-900 rounded-xl overflow-hidden shadow-2xl relative font-mono text-green-500 p-8">
      {/* Background Matrix Effect (CSS) */}
      <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] opacity-5 pointer-events-none bg-cover"></div>
      
      <div className="z-10 w-full flex flex-col h-full gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-green-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold animate-pulse">TRAINING NEURO-SPECTRAL MODEL</h2>
            <p className="text-sm opacity-70">Architecture: ResNet-X Custom | Dataset: 1,000,000 Samples</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold">{Math.round(progress)}%</div>
             <div className="text-xs">COMPLETION</div>
          </div>
        </div>

        {/* Visualization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
          
          {/* Terminal Logs */}
          <div 
            ref={scrollRef}
            className="bg-gray-900/80 border border-green-900/50 p-4 rounded text-xs font-mono overflow-y-auto h-64 md:h-full shadow-inner"
          >
            {logs.map((log, i) => (
              <div key={i} className="mb-1 border-l-2 border-green-700 pl-2">
                <span className="opacity-50">{new Date().toLocaleTimeString()}</span> {">"} {log}
              </div>
            ))}
            <div className="animate-pulse">_</div>
          </div>

          {/* Loss Chart */}
          <div className="bg-gray-900/80 border border-green-900/50 p-4 rounded flex flex-col h-64 md:h-full">
            <h3 className="text-center text-xs uppercase mb-2">Loss Function Optimization</h3>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lossData}>
                  <defs>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="step" hide />
                  <YAxis hide domain={[0, 3]} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#000', borderColor: '#22c55e', color: '#22c55e'}} 
                    itemStyle={{color: '#22c55e'}}
                  />
                  <Area type="monotone" dataKey="loss" stroke="#22c55e" fillOpacity={1} fill="url(#colorLoss)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] mt-2 opacity-60">
              <span>START</span>
              <span>CURRENT EPOCH</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrainingView;
