import React from "react";
import { Box, Button, Card, Flex, Text } from "@sanity/ui";
import { TMessagesConfig } from "../../../types";
import { getConfig } from "../../../utils";

type Props = {
  pending?: boolean;
  count: number;
  labelName?: keyof NonNullable<TMessagesConfig["translationsMaintenance"]>;
  onClick?: (event: React.SyntheticEvent<HTMLButtonElement, Event>) => void;
};

export const MaintenanceTabResult: React.FunctionComponent<Props> = ({
  pending,
  count,
  labelName,
  children,
  onClick,
}) => {
  const config = getConfig();

  return (
    <Card
      padding={3}
      radius={2}
      shadow={1}
      tone={count > 0 ? `caution` : `default`}
    >
      <Flex align="center">
        <Box flex={1}>
          <Text muted={count <= 0}>
            {count}{" "}
            {labelName
              ? config?.messages?.translationsMaintenance?.[labelName]
              : children}
          </Text>
        </Box>

        {count > 0 && (
          <Button padding={2} fontSize={2} disabled={pending} onClick={onClick}>
            {config?.messages?.translationsMaintenance?.fix}
          </Button>
        )}
      </Flex>
    </Card>
  );
};
