
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TimerIcon } from 'lucide-react';
import { isCampaignActive } from '@/lib/utils';

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const calculateTimeLeft = (): TimeLeft => {
    // Treat the string as UTC to avoid timezone shifts.
    const utcTargetDate = new Date(targetDate.endsWith('Z') ? targetDate : `${targetDate}Z`);
    const difference = +utcTargetDate - +new Date();
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the code only runs on the client to prevent hydration mismatch.
    setIsClient(true);
    // Set the initial time left immediately on mount.
    setTimeLeft(calculateTimeLeft());
    
    // Then, set up an interval to update it every second.
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up the interval when the component unmounts.
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  // Use the centralized function to determine if the campaign is active.
  const campaignIsActive = isCampaignActive(targetDate);

  const timerComponents = campaignIsActive && Object.keys(timeLeft).length ? (
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
  
  if (!isClient) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl font-headline">
                <TimerIcon className="w-5 h-5 text-accent" />
                Fim da Campanha em
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around gap-4 h-[76px] items-center">
                    <p>Carregando...</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl font-headline">
          <TimerIcon className="w-5 h-5 text-accent" />
          {campaignIsActive ? "Fim da Campanha em" : "Status da Campanha"}
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
