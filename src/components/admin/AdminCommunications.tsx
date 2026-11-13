"use client";

import { useActionState, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { bodyText, fieldControl, fieldLabel, primaryLink, secondaryLink, sectionTitle, supportText } from "@/components/classes";
import { StatusMessage } from "@/components/StatusMessage";
import {
  previewCampaignAction,
  retryMailAction,
  sendCampaignAction,
  type MailActionState,
} from "@/lib/admin-mail-actions";

type Subscriber = {
  email: string;
  displayName: string;
  locale: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

type TeamRow = {
  teamName: string;
  members: readonly { name: string; email: string; role: string }[];
};

type Delivery = {
  id: string;
  subject: string;
  email: string;
  audience: string;
  status: string;
  error: string;
  updatedAt: string;
};

export function AdminCommunications({
  subscribers,
  teams,
  deliveries,
  availability,
}: {
  subscribers: readonly Subscriber[];
  teams: readonly TeamRow[];
  deliveries: readonly Delivery[];
  availability: "ready" | "missing" | "error";
}) {
  const [query, setQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [page, setPage] = useState(0);
  const [deliveryPage, setDeliveryPage] = useState(0);
  const visible = useMemo(
    () =>
      subscribers.filter((person) => {
        const haystack = `${person.email} ${person.displayName}`.toLowerCase();
        if (query.trim() && !haystack.includes(query.trim().toLowerCase())) {
          return false;
        }

        if (filter === "active") {
          return person.unsubscribedAt === null;
        }

        if (filter === "unsubscribed") {
          return person.unsubscribedAt !== null;
        }

        return true;
      }),
    [subscribers, query, filter],
  );

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Communications"
        lede="Les adresses restent dans l'administration. Un même courriel n'est envoyé qu'une fois par envoi, même s'il appartient à plusieurs groupes."
      />
      {availability !== "ready" ? (
        <div className="admin-in-up">
          <StatusMessage tone="warning">
            {availability === "missing"
              ? "Les tables de courriel ne sont pas encore appliquées."
              : "Les données de courriel n'ont pas pu être lues."}
          </StatusMessage>
        </div>
      ) : null}
      <section className="admin-in-left border border-line bg-canvas px-5 py-6" style={{ ["--admin-delay" as string]: "100ms" }}>
        <h2 className={sectionTitle}>Notifications de publication</h2>
        <p className={`mt-3 ${bodyText}`}>
          Elles partent depuis Annonces, Activités ou Résultats, au moment de publier. La page reste publiée si le courriel échoue. La galerie n&apos;envoie rien.
        </p>
      </section>
      <div className="admin-in-right" style={{ ["--admin-delay" as string]: "160ms" }}>
        <CampaignForm />
      </div>
      <section className="admin-in-up" style={{ ["--admin-delay" as string]: "220ms" }}>
        <h2 className={sectionTitle}>Abonnés à la lettre</h2>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Rechercher"
            className={`${fieldControl} mt-0 md:max-w-sm`}
          />
          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as typeof filter);
              setPage(0);
            }}
            className={`${fieldControl} mt-0 md:max-w-xs`}
          >
            <option value="all">Tous</option>
            <option value="active">Inscrits</option>
            <option value="unsubscribed">Désinscrits</option>
          </select>
        </div>
        <ul className="mt-4 divide-y divide-line border border-line">
          {visible.length === 0 ? <li className={`px-4 py-4 ${supportText}`}>Aucun abonné pour cette recherche.</li> : null}
          {visible.slice(page * 20, page * 20 + 20).map((person) => (
            <li key={person.email} className="px-4 py-3">
              <p className="font-semibold text-ink">{person.email}</p>
              <p className={supportText}>
                {person.displayName || "Sans nom"} · {person.locale} · inscrit le {person.subscribedAt.slice(0, 10)} ·{" "}
                {person.unsubscribedAt ? `désinscrit le ${person.unsubscribedAt.slice(0, 10)}` : "actif"}
              </p>
            </li>
          ))}
        </ul>
        {visible.length > 20 ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" className={secondaryLink} disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
              Précédent
            </button>
            <p className={supportText}>
              {page + 1} / {Math.ceil(visible.length / 20)}
            </p>
            <button
              type="button"
              className={secondaryLink}
              disabled={(page + 1) * 20 >= visible.length}
              onClick={() => setPage((current) => current + 1)}
            >
              Suivant
            </button>
          </div>
        ) : null}
      </section>
      <section>
        <h2 className={sectionTitle}>Destinataires des équipes</h2>
        <input
          value={teamQuery}
          onChange={(event) => setTeamQuery(event.target.value)}
          placeholder="Rechercher une équipe ou une adresse"
          className={`${fieldControl} mt-4 md:max-w-sm`}
        />
        <ul className="mt-4 space-y-4">
          {teams.length === 0 ? <li className={supportText}>Aucune équipe enregistrée.</li> : null}
          {teams.filter((team) => {
            const haystack = `${team.teamName} ${team.members.map((member) => `${member.name} ${member.email}`).join(" ")}`.toLowerCase();
            const needle = teamQuery.trim().toLowerCase();
            return needle.length === 0 || haystack.includes(needle);
          }).map((team) => (
            <li key={team.teamName} className="border border-line bg-canvas px-4 py-4">
              <h3 className="font-semibold text-ink">{team.teamName}</h3>
              <ul className="mt-2">
                {team.members.map((member) => (
                  <li key={member.email} className={bodyText}>
                    {member.name} · {member.email} · {member.role === "leader" ? "responsable" : member.role === "deputy" ? "adjoint" : "membre"}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className={sectionTitle}>Historique des envois</h2>
        <RetryForm />
        <ul className="mt-4 divide-y divide-line border border-line">
          {deliveries.length === 0 ? <li className={`px-4 py-4 ${supportText}`}>Aucun envoi.</li> : null}
          {deliveries.slice(deliveryPage * 20, deliveryPage * 20 + 20).map((item) => (
            <li key={item.id} className="px-4 py-3">
              <p className="font-semibold text-ink">
                <span className={item.status === "failed" ? "text-danger" : item.status === "sent" ? "text-success" : "text-warning"}>{item.status}</span>
                {" · "}
                {item.email}
              </p>
              <p className={supportText}>
                {item.subject} · {item.audience} · {item.updatedAt.slice(0, 16).replace("T", " ")}
                {item.error ? ` · ${item.error}` : ""}
              </p>
            </li>
          ))}
        </ul>
        {deliveries.length > 20 ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" className={secondaryLink} disabled={deliveryPage === 0} onClick={() => setDeliveryPage((current) => Math.max(0, current - 1))}>
              Précédent
            </button>
            <p className={supportText}>
              {deliveryPage + 1} / {Math.ceil(deliveries.length / 20)}
            </p>
            <button type="button" className={secondaryLink} disabled={(deliveryPage + 1) * 20 >= deliveries.length} onClick={() => setDeliveryPage((current) => current + 1)}>
              Suivant
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function CampaignForm() {
  const [preview, previewAction, previewPending] = useActionState(previewCampaignAction, null);
  const [sent, sendAction, sendPending] = useActionState(sendCampaignAction, null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [publicPath, setPublicPath] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");

  return (
    <section className="border border-line bg-canvas px-5 py-5">
      <h2 className={sectionTitle}>Campagne indépendante</h2>
      <p className={`mt-2 ${supportText}`}>Invitation, rappel ou message qui n&apos;accompagne pas une publication du site. Le bouton est facultatif.</p>
      <form className="mt-4 space-y-4">
        <fieldset className="space-y-2">
          <legend className={fieldLabel}>Destinataires</legend>
          <label className="flex min-h-11 items-center gap-3">
            <input name="audience" type="checkbox" value="teams" /> Toutes les équipes
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input name="audience" type="checkbox" value="leaders" /> Responsables
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input name="audience" type="checkbox" value="members" /> Membres, hors responsables
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input name="audience" type="checkbox" value="subscribers" /> Abonnés à la lettre
          </label>
        </fieldset>
        <label className={fieldLabel}>
          Sujet
          <input name="subject" required maxLength={180} value={subject} onChange={(event) => setSubject(event.target.value)} className={fieldControl} />
          <span className={`mt-1 block ${supportText}`}>{subject.length} / 180</span>
        </label>
        <label className={fieldLabel}>
          Message
          <textarea
            name="body"
            required
            rows={8}
            maxLength={7800}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className={fieldControl}
          />
          <span className={`mt-1 block ${body.length >= 7800 ? "font-semibold text-warning" : supportText}`}>
            {body.length.toLocaleString("fr-FR")} / 7&nbsp;800
            {body.length >= 7800 ? " — limite atteinte" : ""}
          </span>
        </label>
        <label className={fieldLabel}>
          Langue du message
          <select name="locale" defaultValue="fr" className={fieldControl}>
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </label>
        <label className={fieldLabel}>
          Libellé du bouton (facultatif)
          <input name="ctaLabel" maxLength={80} value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} className={fieldControl} />
        </label>
        <label className={fieldLabel}>
          Lien public du bouton (facultatif)
          <input name="publicPath" placeholder="/fr/annonces/exemple" value={publicPath} onChange={(event) => setPublicPath(event.target.value)} className={fieldControl} />
        </label>
        <div className="border border-line bg-surface px-4 py-4">
          <p className="font-semibold text-ink">Aperçu</p>
          <p className={`mt-2 ${bodyText}`}>{subject.trim() || "Sujet non saisi"}</p>
          <p className={`mt-2 whitespace-pre-wrap ${bodyText}`}>{body.trim() || "Message non saisi"}</p>
          {ctaLabel.trim() && publicPath.trim() ? <p className={`mt-3 inline-block bg-action px-4 py-2 font-semibold text-white`}>{ctaLabel.trim()}</p> : null}
          {publicPath.trim() ? <p className={`mt-2 ${supportText}`}>{publicPath.trim()}</p> : null}
          <p className={`mt-2 ${supportText}`}>Les désinscrits sont exclus. Une adresse présente dans plusieurs groupes ne compte qu&apos;une fois. Quinze courriels au plus partent par envoi.</p>
        </div>
        <label className="flex min-h-11 items-center gap-3 text-ink">
          <input name="confirm" type="checkbox" value="yes" />
          Je confirme l&apos;envoi de ce message.
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" formAction={previewAction} className={secondaryLink} disabled={previewPending}>
            Compter les destinataires
          </button>
          <button type="submit" formAction={sendAction} className={primaryLink} disabled={sendPending}>
            Envoyer
          </button>
        </div>
      </form>
      <MailNotice state={preview} />
      <MailNotice state={sent} />
    </section>
  );
}

function RetryForm() {
  const [state, action, pending] = useActionState(retryMailAction, null);
  return (
    <form action={action} className="mt-4">
        <button type="submit" className={secondaryLink} disabled={pending}>
        Reprendre les envois en attente ou en échec
      </button>
      <MailNotice state={state} />
    </form>
  );
}

function MailNotice({ state }: { state: MailActionState }) {
  if (!state) {
    return null;
  }

  if (state.status === "preview") {
    return <p className={`mt-3 ${bodyText}`}>Destinataires estimés, sans doublon : {state.count}.</p>;
  }

  if (state.status === "forbidden") {
    return <p className={`mt-3 font-semibold text-warning`}>Accès refusé. Votre message est conservé.</p>;
  }

  if (state.status === "invalid") {
    return (
      <p className={`mt-3 font-semibold text-warning`}>
        {state.detail ??
          "Vérifiez le sujet, le message, les destinataires et la confirmation. Le bouton exige un lien /fr ou /en. Votre saisie est conservée."}
      </p>
    );
  }

  if (state.status === "sent") {
    return <p className={`mt-3 ${bodyText}`}>{state.detail ?? "Envoi terminé."}</p>;
  }

  return (
    <p className={`mt-3 font-semibold text-warning`}>
      {state.detail ?? "L'envoi n'a pas abouti. Votre message est conservé."}
    </p>
  );
}
