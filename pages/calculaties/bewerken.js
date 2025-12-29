import { useRouter } from 'next/router';
import WorkflowActions from "../../components/WorkflowActions";
import { useProject } from "../../components/ProjectContext";
import { useEffect, useState } from 'react';

export default function CalculatieBewerken({ session }) {
  const router = useRouter();
  const { id } = router.query; // Haal ID uit de URL query
  const { projectId: contextProjectId, setProjectId } = useProject();
  const [isClient, setIsClient] = useState(false);

  // Sync route ID met context
  useEffect(() => {
    setIsClient(true);
    if (id && setProjectId) {
      setProjectId(id);
    }
  }, [id, setProjectId]);

  // Gebruik óf route ID óf context ID
  const effectiveProjectId = id || contextProjectId;

  const actions = [
    {
      workflow_key: "calculatie_optimaliseren",
      label: "Optimaliseren",
      onRun: () => {
        fetch("/api/workflow/run", {
          method: "POST",
          body: JSON.stringify({
            workflow_key: "calculatie_optimaliseren",
            project_id: effectiveProjectId
          })
        })
      }
    },
    {
      workflow_key: "calculatie_fixeren",
      label: "Zet vast als Fixed Price",
      onRun: () => {
        fetch("/api/workflow/run", {
          method: "POST",
          body: JSON.stringify({
            workflow_key: "calculatie_fixeren",
            project_id: effectiveProjectId
          })
        })
      }
    }
  ];

  // Toon loading state tijdens build/server render
  if (!isClient) {
    return (
      <div>
        <h1>Calculatie bewerken</h1>
        <p>Laden...</p>
      </div>
    );
  }

  if (!effectiveProjectId) {
    return (
      <div>
        <h1>Calculatie bewerken</h1>
        <p className="text-red-500">Geen project ID gevonden. Ga terug naar overzicht.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Calculatie bewerken ({effectiveProjectId})</h1>

      <WorkflowActions
        userId={session?.user?.id}
        actions={actions}
      />
    </div>
  );
}

// VOEG DEZE TOE voor server-side rendering:
export async function getServerSideProps(context) {
  // Haal session op (afhankelijk van je auth systeem)
  const { req } = context;
  // Je session logica hier...
  
  return {
    props: {
      session: { user: { id: 'temp' } }, // placeholder
      // projectId komt nu via router.query
    },
  };
}
