// pages/calculaties/bewerken.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import WorkflowActions from "../../components/WorkflowActions";

export default function CalculatieBewerken({ session }) {
  const router = useRouter();
  const { id } = router.query;
  const [mounted, setMounted] = useState(false);

  // Alleen client-side renderen
  useEffect(() => {
    setMounted(true);
  }, []);

  // Build/server: minimal render
  if (!mounted) {
    return (
      <div>
        <h1>Calculatie bewerken</h1>
        <p>...</p>
      </div>
    );
  }

  // Nu hebben we id (client-side)
  const actions = [
    {
      workflow_key: "calculatie_optimaliseren",
      label: "Optimaliseren",
      disabled: !id,
      onRun: () => {
        if (!id) return;
        fetch("/api/workflow/run", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow_key: "calculatie_optimaliseren",
            project_id: id
          })
        });
      }
    },
    {
      workflow_key: "calculatie_fixeren",
      label: "Zet vast als Fixed Price",
      disabled: !id,
      onRun: () => {
        if (!id) return;
        fetch("/api/workflow/run", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow_key: "calculatie_fixeren",
            project_id: id
          })
        });
      }
    }
  ];

  return (
    <div>
      <h1>Calculatie {id ? `#${id}` : ''} bewerken</h1>
      <WorkflowActions
        userId={session?.user?.id}
        actions={actions}
      />
    </div>
  );
}

// Server-side session
export async function getServerSideProps(context) {
  // JOUW SESSION LOGICA HIER
  const session = { 
    user: { 
      id: 'user-id-placeholder'
    }
  };
  
  return { props: { session } };
}
