import { CaseDetail } from "../../components/CaseDetail";
import { UseCaseShowcase } from "../../components/UseCaseShowcase";

export default function BusinessControlsPage() {
  return (
    <CaseDetail
      eyebrow="Use case 04 · Business controls"
      title="Carry approved business restrictions into agent actions."
      intro="Turn organization-owned requirements into shared, operational rules for the fleet."
      status="Reference policy patterns"
      tone="slate"
      rule="Every governed action must satisfy the applicable organization-approved restrictions."
      situation="Organizations already maintain rules around spending, data handling, counterparties, destinations, and human oversight. Agent fleets need a consistent way to apply those rules at the point of action."
      problemTitle="Rules scattered across prompts and tools drift apart."
      problem="An instruction in one agent’s prompt may be absent from another’s. Tool-specific checks can also interpret the same requirement differently, creating gaps that are hard to inspect."
      steps={[
        { title: "Define", body: "The organization supplies approved rules, trusted inputs, and responsible owners." },
        { title: "Match", body: "SAGE selects the relevant restrictions for the agent and requested action." },
        { title: "Decide", body: "The action is allowed, declined, or paused for human review." },
        { title: "Evidence", body: "The applied rule, decision, and action result stay connected." },
      ]}
      outcomes={[
        "One operational route for approved restrictions",
        "Consistent escalation conditions across the fleet",
        "Inspectable evidence for internal review",
      ]}
      scope={[
        "SAGE applies rules the organization provides; it does not determine which laws or regulations apply.",
        "A governed workflow can support compliance programs, but SAGE does not certify compliance.",
        "Legal interpretation, control ownership, validation, and monitoring remain organizational responsibilities.",
      ]}
    >
      <section className="section section-demo">
        <div className="shell">
          <p className="eyebrow">See the control route</p>
          <UseCaseShowcase variant="business-controls" />
        </div>
      </section>
    </CaseDetail>
  );
}
