import React, { memo } from "react";
import { Text, View } from "react-native";
import { getAccountBrand } from "../data/accountBrands";
import { MoneyAccount } from "../features/spendingMemory.types";
import { componentStyles } from "../theme/styles/components";

type AccountMarkProps = {
  kind?: MoneyAccount["kind"];
  label: string;
  size?: "small" | "medium";
};

function AccountMarkComponent({
  kind = "other",
  label,
  size = "medium"
}: AccountMarkProps) {
  const brand = getAccountBrand(label, kind);
  const markStyle = {
    backgroundColor: brand.backgroundColor,
    borderColor: brand.borderColor
  };
  const textStyle = {
    color: brand.foregroundColor
  };

  return (
    <View style={[componentStyles.accountMark, size === "small" && componentStyles.accountMarkSmall, markStyle]}>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        numberOfLines={1}
        style={[componentStyles.accountMarkText, size === "small" && componentStyles.accountMarkTextSmall, textStyle]}
      >
        {brand.shortLabel}
      </Text>
    </View>
  );
}

export const AccountMark = memo(AccountMarkComponent);