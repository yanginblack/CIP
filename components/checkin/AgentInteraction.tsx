"use client";

import { WaitingMessage } from "./WaitingMessage";
import { AssistantSection } from "./AssistantSection";

export function AgentInteraction() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          Agent Support
        </h2>
        <p className="text-gray-600">
          An agent will assist you shortly
        </p>
      </div>

      {/* Waiting Message */}
      <WaitingMessage />

      {/* Online Assistant Section */}
      <AssistantSection />
    </div>
  );
}
