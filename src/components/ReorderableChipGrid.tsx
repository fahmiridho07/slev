import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleProp,
  View,
  ViewStyle
} from "react-native";
import { hapticLight, hapticSelection } from "../lib/haptics";
import { reorderItemsByKey } from "../lib/applyItemOrder";

type ChipLayout = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type ReorderableChipGridProps<T> = {
  chipAccessibilityLabel: (item: T) => string;
  chipStyle: (active: boolean, dragging: boolean, hover: boolean) => StyleProp<ViewStyle>;
  getKey: (item: T) => string;
  items: T[];
  onReorder: (items: T[]) => void;
  onSelect: (item: T) => void;
  renderChip: (item: T, active: boolean) => React.ReactNode;
  selectedKey: string;
  wrapStyle: StyleProp<ViewStyle>;
};

function ReorderableChipGridComponent<T>({
  chipAccessibilityLabel,
  chipStyle,
  getKey,
  items,
  onReorder,
  onSelect,
  renderChip,
  selectedKey,
  wrapStyle
}: ReorderableChipGridProps<T>) {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const draggingKeyRef = useRef<string | null>(null);
  const layoutsRef = useRef(new Map<string, ChipLayout>());
  const chipRefs = useRef(new Map<string, View | null>());
  const dragOffset = useRef(new Animated.ValueXY()).current;

  const refreshLayouts = useCallback(() => {
    for (const item of items) {
      const key = getKey(item);
      const node = chipRefs.current.get(key);
      node?.measureInWindow((x, y, width, height) => {
        layoutsRef.current.set(key, { x, y, width, height });
      });
    }
  }, [getKey, items]);

  useEffect(() => {
    refreshLayouts();
  }, [items, refreshLayouts]);

  const findDropTarget = useCallback((pageX: number, pageY: number, excludeKey: string) => {
    for (const item of items) {
      const key = getKey(item);
      if (key === excludeKey) {
        continue;
      }

      const layout = layoutsRef.current.get(key);
      if (!layout) {
        continue;
      }

      if (
        pageX >= layout.x
        && pageX <= layout.x + layout.width
        && pageY >= layout.y
        && pageY <= layout.y + layout.height
      ) {
        return key;
      }
    }

    return null;
  }, [getKey, items]);

  const finishDrag = useCallback(
    (pageX: number, pageY: number) => {
      const activeKey = draggingKeyRef.current;
      if (!activeKey) {
        return;
      }

      const targetKey = findDropTarget(pageX, pageY, activeKey);
      if (targetKey) {
        const fromIndex = items.findIndex((item) => getKey(item) === activeKey);
        const toIndex = items.findIndex((item) => getKey(item) === targetKey);
        if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
          onReorder(reorderItemsByKey(items, activeKey, targetKey, getKey));
          hapticSelection();
        }
      }

      draggingKeyRef.current = null;
      setDraggingKey(null);
      setHoverKey(null);
      dragOffset.setValue({ x: 0, y: 0 });
    },
    [dragOffset, findDropTarget, getKey, items, onReorder]
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => Boolean(draggingKeyRef.current),
      onPanResponderMove: (_, gesture) => {
        dragOffset.setValue({ x: gesture.dx, y: gesture.dy });
        const nextHover = findDropTarget(gesture.moveX, gesture.moveY, draggingKeyRef.current ?? "");
        setHoverKey((current) => (current === nextHover ? current : nextHover));
      },
      onPanResponderRelease: (_, gesture) => {
        finishDrag(gesture.moveX, gesture.moveY);
      },
      onPanResponderTerminate: (_, gesture) => {
        finishDrag(gesture.moveX, gesture.moveY);
      }
    })
  ).current;

  const startDrag = useCallback(
    (key: string) => {
      refreshLayouts();
      draggingKeyRef.current = key;
      setDraggingKey(key);
      setHoverKey(null);
      hapticLight();
    },
    [refreshLayouts]
  );

  return (
    <View style={wrapStyle}>
      {items.map((item) => {
        const key = getKey(item);
        const active = selectedKey === key;
        const dragging = draggingKey === key;
        const hover = hoverKey === key && draggingKey !== null && draggingKey !== key;

        return (
          <View
            key={key}
            collapsable={false}
            ref={(node) => {
              chipRefs.current.set(key, node);
            }}
            onLayout={refreshLayouts}
          >
            <Animated.View
              style={[
                dragging
                  ? {
                      elevation: 6,
                      transform: dragOffset.getTranslateTransform(),
                      zIndex: 20
                    }
                  : undefined
              ]}
              {...(dragging ? panResponder.panHandlers : undefined)}
            >
              <Pressable
                accessibilityHint={undefined}
                accessibilityLabel={chipAccessibilityLabel(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                delayLongPress={350}
                onLongPress={() => startDrag(key)}
                onPress={() => {
                  if (!draggingKeyRef.current) {
                    onSelect(item);
                  }
                }}
                style={chipStyle(active, dragging, hover)}
              >
                {renderChip(item, active)}
              </Pressable>
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

export const ReorderableChipGrid = memo(ReorderableChipGridComponent) as typeof ReorderableChipGridComponent;