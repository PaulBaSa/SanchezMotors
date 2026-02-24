import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';
import { WorkOrder } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/formatters';

interface OrderCardProps {
  order: WorkOrder;
  onPress: () => void;
  onEditPress?: () => void;
}

export function OrderCard({ order, onPress, onEditPress }: OrderCardProps) {
  const completedTasks = order.tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = order.tasks.length;
  const photosCount = order.photos.filter((p) => p.uri).length;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View>
          <Text style={styles.otId}>OT #{order.id}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={styles.headerRight}>
          <StatusBadge status={order.status} />
          {onEditPress && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation();
                onEditPress();
              }}
            >
              <Ionicons name="pencil" size={18} color={COLORS.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.vehicleInfo}>
        <Ionicons name="car-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.vehicleText}>
          {order.vehicle.brand
            ? `${order.vehicle.brand} ${order.vehicle.model} ${order.vehicle.year}`
            : 'Sin datos de vehículo'}
        </Text>
      </View>

      {order.vehicle.plates ? (
        <View style={styles.platesContainer}>
          <Text style={styles.plates}>{order.vehicle.plates}</Text>
        </View>
      ) : null}

      {order.clientName ? (
        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.clientName}>{order.clientName}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="camera-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{photosCount}/6</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="construct-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>
            {completedTasks}/{totalTasks} tareas
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editButton: {
    padding: SPACING.xs,
  },
  otId: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  vehicleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  platesContainer: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  plates: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  clientName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
