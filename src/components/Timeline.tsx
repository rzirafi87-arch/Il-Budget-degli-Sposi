"use client";
import { CalendarCheck, Camera, Car, Clock, Flower2, Heart, Mail, MapPin, Music, PartyPopper, Sparkles, Users } from "lucide-react";
import React from "react";

export type TimelineItem = {
  time: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  completed?: boolean;
};

type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

// Icon mapping helper
const ICON_MAP: Record<string, React.ReactNode> = {
  calendar: <CalendarCheck className="h-5 w-5" />,
  clock: <Clock className="h-5 w-5" />,
  location: <MapPin className="h-5 w-5" />,
  party: <PartyPopper className="h-5 w-5" />,
  camera: <Camera className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  flowers: <Flower2 className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
};

export function getTimelineIcon(key: string): React.ReactNode {
  return ICON_MAP[key] || <CalendarCheck className="h-5 w-5" />;
}

export default function Timeline({ items, className = "" }: TimelineProps) {
  return (
    <ol className={`relative border-s border-gray-200 pl-6 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="mb-8 ms-6">
          <span
            className={`absolute -start-3 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
              item.completed
                ? "bg-emerald-100 text-emerald-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {item.icon ?? <CalendarCheck className="h-4 w-4" />}
          </span>
          <time className="mb-1 block text-xs font-medium text-gray-500">
            {item.time}
          </time>
          <h3 className="text-base font-semibold text-gray-900">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
