'use client';

interface BarChartProps {
  data: Array<{ date: string; bookings: number }>;
  height?: number;
}

export function BarChart({ data, height = 320 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.bookings));
  const chartWidth = 100; // percentage
  const barWidth = 100 / data.length - 1; // percentage per bar with gap
  
  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <svg width="100%" height="100%" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 40 + (i * 60);
          return (
            <line
              key={i}
              x1="40"
              y1={y}
              x2="760"
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          );
        })}
        
        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => {
          const value = Math.round(maxValue - (i * maxValue / 4));
          const y = 40 + (i * 60);
          return (
            <text
              key={i}
              x="30"
              y={y + 4}
              fill="#6B7280"
              fontSize="12"
              textAnchor="end"
              fontFamily="var(--font-family)"
            >
              {value}
            </text>
          );
        })}
        
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.bookings / maxValue) * 240;
          const x = 50 + (index * 45);
          const y = 280 - barHeight;
          
          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width="36"
                height={barHeight}
                fill="#9DAE91"
                rx="8"
                ry="8"
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.fill = '#8A9D82';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.fill = '#9DAE91';
                }}
              />
              
              {/* X-axis label */}
              <text
                x={x + 18}
                y="300"
                fill="#6B7280"
                fontSize="11"
                textAnchor="middle"
                fontFamily="var(--font-family)"
              >
                {item.date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
