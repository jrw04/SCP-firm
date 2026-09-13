"use client";

import * as React from "react";
import { Paperclip, Send, EyeOff, Megaphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { formatDateTime } from "@/lib/utils";

function renderWithMentions(content: string) {
  const parts = content.split(/(@[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="rounded bg-gold-100 px-1 py-0.5 font-medium text-gold-600">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export function ChatThread({ dossierId }: { dossierId: string }) {
  const messages = useAppStore((s) => s.messages).filter((m) => m.dossierId === dossierId);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const { staffUser } = useAuth();
  const [content, setContent] = React.useState("");
  const [attachment, setAttachment] = React.useState("");
  const [publish, setPublish] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!staffUser || !content.trim()) return;
    sendMessage(dossierId, content.trim(), staffUser, publish, attachment.trim() ? [attachment.trim()] : undefined);
    setContent("");
    setAttachment("");
    setPublish(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Fil de discussion interne</CardTitle>
          <Badge variant="outline" className="gap-1 text-[10px]">
            <EyeOff className="h-3 w-3" /> Masqué au client
          </Badge>
        </div>
        <CardDescription>Utilisez @Nom pour mentionner un collaborateur.</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="mb-3 flex max-h-96 flex-col gap-3 overflow-y-auto thin-scrollbar pr-1">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-2.5">
              <Avatar
                user={{ id: m.authorId, name: m.authorName, email: "", role: m.authorRole, initials: m.authorName.split(" ").map((w) => w[0]).slice(-2).join(""), color: m.authorRole === "ASSOCIATE" ? "#0f172a" : "#0f766e" }}
                size={28}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-medium text-brand-dark">{m.authorName}</p>
                  <p className="text-[11px] text-slate-400">{formatDateTime(m.createdAt)}</p>
                </div>
                <p className="text-sm text-slate-600">{renderWithMentions(m.content)}</p>
                {m.isPublicToClient && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-gold-600">
                    <Megaphone className="h-3 w-3" /> Note publiée sur l’extranet client
                  </span>
                )}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {m.attachments.map((a, i) => (
                      <span key={i} className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-brand-gray">
                        <Paperclip className="h-3 w-3" /> {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Aucun message pour le moment.</p>}
        </div>

        <form onSubmit={handleSend} className="flex flex-col gap-2 border-t border-slate-100 pt-3">
          <Textarea
            placeholder="Écrire un message… (@Nom pour mentionner)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <input
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
              placeholder="Nom de la pièce jointe (optionnel)"
              className="h-8 flex-1 rounded-md border border-slate-200 px-2 text-xs text-brand-dark placeholder:text-slate-400"
            />
            {staffUser?.role === "ASSOCIATE" && (
              <label className="flex items-center gap-1.5 text-xs text-brand-gray">
                <Switch checked={publish} onCheckedChange={setPublish} />
                Publier au client
              </label>
            )}
            <Button type="submit" size="sm" variant="gold" disabled={!content.trim()}>
              <Send className="h-3.5 w-3.5" /> Envoyer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
