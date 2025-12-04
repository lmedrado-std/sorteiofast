"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TimerIcon } from 'lucide-react';

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({});

  useEffect(() => {
    // Set initial value on client mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);


  const timerComponents = Object.keys(timeLeft).length ? (
    Object.entries(timeLeft).map(([interval, value]) => (
      <div key={interval} className="flex flex-col items-center">
        <span className="text-4xl md:text-6xl font-bold text-primary tracking-tighter">
          {String(value).padStart(2, '0')}
        </span>
        <span className="text-xs uppercase text-foreground/70">{interval}</span>
      </div>
    ))
  ) : (
    <div className="text-2xl font-bold text-primary">Campanha Encerrada!</div>
  );

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-headline">
          <TimerIcon className="w-5 h-5 text-accent" />
          Fim da Campanha em
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around gap-4">
          {timerComponents}
        </div>
      </CardContent>
    </Card>
  );
}
