
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TimerIcon } from "lucide-react";
import { isCampaignActive as isCampaignStillActive } from '@/lib/utils';


interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const calculateTimeLeft = (): TimeLeft => {
    // Interpreta a data alvo como data local, sem forçar UTC.
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
  const [isClient, setIsClient] = useState(false);
  
  // A verificação de campanha ativa agora é feita por uma função centralizada.
  const isCampaignActive = useMemo(() => isCampaignStillActive(targetDate), [targetDate]);


  useEffect(() => {
    // Garante que o código só rode no cliente para evitar hydration mismatch.
    setIsClient(true);
    
    // Calcula o tempo inicial ao montar o componente.
    if (isCampaignActive) {
      setTimeLeft(calculateTimeLeft());
    }
    
    // Configura o intervalo para atualizar a cada segundo.
    const timer = setInterval(() => {
      if (isCampaignStillActive(targetDate)) {
        setTimeLeft(calculateTimeLeft());
      } else {
        // Se a campanha acabou, limpa o tempo e o intervalo.
        setTimeLeft({});
        clearInterval(timer);
      }
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado.
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate, isCampaignActive]);


  const unitsLabel: Record<keyof Required<TimeLeft>, string> = {
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
          {isCampaignActive ? "Fim da Campanha em" : "Status da Campanha"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCampaignActive && Object.keys(timeLeft).length > 0 ? (
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {(Object.keys(unitsLabel) as (keyof TimeLeft)[]).map(
              (unit) => (
                <div
                  key={unit}
                  className="flex flex-col items-center rounded-xl bg-muted/60 px-2 py-2 md:px-3 md:py-3"
                >
                  <span className="text-2xl md:text-4xl font-bold text-primary leading-none tracking-tight">
                    {String(timeLeft[unit] ?? 0).padStart(2, "0")}
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
