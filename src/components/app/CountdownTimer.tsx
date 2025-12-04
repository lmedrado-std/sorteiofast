
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TimerIcon } from "lucide-react";
import { isCampaignActive } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const calculateState = () => {
      const active = isCampaignActive(targetDate);
      setIsActive(active);

      if (active) {
        const difference = +new Date(targetDate) - +new Date();
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateState();
    const timer = setInterval(calculateState, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const unitsLabel: Record<keyof TimeLeft, string> = {
    days: "Dias",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
  };
  
  if (!isClient) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl font-headline">
                <TimerIcon className="w-5 h-5 text-accent" />
                Status da Campanha
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center h-[76px]">
                    <p className="text-sm text-foreground/70">Carregando contador...</p>
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
          {isActive ? "Fim da Campanha em" : "Status da Campanha"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isActive && timeLeft ? (
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {(Object.keys(unitsLabel) as (keyof TimeLeft)[]).map(
              (unit) => (
                <div
                  key={unit}
                  className="flex flex-col items-center rounded-xl bg-muted/60 px-2 py-2 md:px-3 md:py-3"
                >
                  <span className="text-2xl md:text-4xl font-bold text-primary leading-none tracking-tight">
                    {String(timeLeft[unit]).padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-[10px] md:text-xs uppercase tracking-wide text-foreground/70">
                    {unitsLabel[unit]}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="flex h-[76px] items-center justify-center">
            <p className="text-base md:text-lg font-semibold text-primary">
              Campanha Encerrada!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
