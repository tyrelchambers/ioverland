import React from "react";
import { Button } from "./ui/button";
import { useDomainUser } from "@/hooks/useDomainUser";
import { PublicProfile } from "@/types";
import { Loader2 } from "lucide-react";

const FollowBtn = ({ data }: { data: PublicProfile }) => {
  const { follow, user, account, unfollow } = useDomainUser();

  return (
    <>
      {user.data?.uuid !== data.uuid && (
        <>
          {account.data?.following?.find((d) => d.uuid === data.uuid) ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                unfollow.mutate({
                  user_id: data.uuid,
                  username: data.username,
                })
              }
              disabled={unfollow.isPending}
            >
              {unfollow.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Unfollow"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() =>
                follow.mutate({
                  user_id: data.uuid,
                  username: data.username,
                })
              }
              disabled={unfollow.isPending}
            >
              {follow.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Follow"
              )}
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default FollowBtn;
