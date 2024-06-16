import Header from "@/components/Header";
import { H1 } from "@/components/Heading";
import { AvatarWrapper } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroup } from "@/hooks/useGroup";
import { useRequests } from "@/hooks/useRequests";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/router";
import React from "react";

const Requests = () => {
  const {
    query: { id },
  } = useRouter();
  const { requests, decision } = useRequests({
    group_id: id as string,
  });

  const decisionHandler = (choice: "approve" | "deny", user_id: string) => {
    decision.mutate({
      decision: choice,
      group_id: id as string,
      user_id,
    });
  };

  return (
    <main>
      <Header />

      <section className="w-full max-w-screen-md mx-auto my-10">
        <H1>Join requests</H1>

        <div className="flex flex-col gap-4 mt-8">
          {requests.data?.map((req) => (
            <div
              key={req.userId}
              className="flex items-center border border-border p-3 rounded-lg"
            >
              <AvatarWrapper image_url={req.user.image_url} />

              <div className="flex flex-col flex-1 ml-4">
                <p className="font-medium">{req.user.username}</p>
                <p className="text-sm text-foreground/60">
                  joined {formatDistanceToNow(new Date(req.user.created_at))}
                </p>
              </div>
              {req.status === "pending" ? (
                <>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decisionHandler("deny", req.userId)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => decisionHandler("approve", req.userId)}
                    >
                      Approve
                    </Button>
                  </div>
                </>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Request {req.status}
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Requests;
