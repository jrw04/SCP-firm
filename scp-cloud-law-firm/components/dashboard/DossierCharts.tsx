"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DOSSIER_STATUS_ORDER, DOSSIER_STATUS_LABELS } from "@/types/database";
import type { Dossier, User } from "@/types/database";

const STAGE_COLORS = ["#94a3b8", "#0e7490", "#d4af37", "#4f46e5", "#b45309", "#10b981"];

export function DossierStageChart({ dossiers }: { dossiers: Dossier[] }) {
  const data = DOSSIER_STATUS_ORDER.map((status) => ({
    status,
    label: DOSSIER_STATUS_LABELS[status].replace(/^\d\.\s*/, ""),
    count: dossiers.filter((d) => d.status === status).length,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des dossiers par étape</CardTitle>
        <CardDescription>Vue d’ensemble du workflow Transit Parquet / Cour.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DossiersByAssociateChart({ dossiers, associates }: { dossiers: Dossier[]; associates: User[] }) {
  const data = associates.map((a) => ({
    name: a.name.replace("Me ", ""),
    count: dossiers.filter((d) => d.associeReferentId === a.id && d.status !== "ARCHIVE").length,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dossiers actifs par associé référent</CardTitle>
        <CardDescription>Charge actuelle, hors dossiers archivés.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
