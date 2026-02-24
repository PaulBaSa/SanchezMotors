// =============================================
// Tab 1: Reception & Digital Checklist
// - OT Generator (YYMMDD-##)
// - Vehicle data form
// - 6-photo mandatory inspection
// - Reason for visit notes
// =============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../../src/constants/theme';
import { FormField } from '../../src/components/FormField';
import { ActionButton } from '../../src/components/ActionButton';
import { PhotoGrid } from '../../src/components/PhotoGrid';
import { OrderCard } from '../../src/components/OrderCard';
import { OrderView } from '../../src/components/OrderView';
import { useApp } from '../../src/storage/AppContext';
import { generateOTId } from '../../src/utils/otGenerator';
import { createEmptyOrder } from '../../src/storage/orderStorage';
import { WorkOrder, VehicleInfo, InspectionPhoto } from '../../src/types';

export default function ReceptionScreen() {
  const { orders, currentOrder, setCurrentOrder, saveCurrentOrder, loadOrders } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [editOrder, setEditOrder] = useState<WorkOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<WorkOrder | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const hasBeenFocused = useRef(false);
  const isCreatingRef = useRef(false);
  const isViewingRef = useRef(false);

  // Track state changes in refs
  useEffect(() => {
    isCreatingRef.current = isCreating;
  }, [isCreating]);

  useEffect(() => {
    isViewingRef.current = isViewing;
  }, [isViewing]);

  // Reset to order list when tab is tapped while already on it
  useFocusEffect(
    useCallback(() => {
      if (hasBeenFocused.current && (isCreatingRef.current || isViewingRef.current)) {
        // Tab was tapped while viewing/editing - reset to order list
        setIsCreating(false);
        setEditOrder(null);
        setCurrentOrder(null);
        setIsViewing(false);
        setViewingOrder(null);
      }
      hasBeenFocused.current = true;

      return () => {
        // Cleanup if needed
      };
    }, [setCurrentOrder])
  );

  useEffect(() => {
    if (currentOrder) {
      setEditOrder({ ...currentOrder });
      setIsCreating(true);
    }
  }, [currentOrder]);

  const handleNewOrder = async () => {
    const otId = await generateOTId();
    const newOrder = createEmptyOrder(otId);
    setEditOrder(newOrder);
    setIsCreating(true);
  };

  const handleVehicleChange = (field: keyof VehicleInfo, value: string) => {
    if (!editOrder) return;
    setEditOrder({
      ...editOrder,
      vehicle: { ...editOrder.vehicle, [field]: value },
    });
  };

  const handlePhotosChange = (photos: InspectionPhoto[]) => {
    if (!editOrder) return;
    setEditOrder({ ...editOrder, photos });
  };

  const handleSave = async () => {
    if (!editOrder) return;

    // Validate required fields
    if (!editOrder.vehicle.plates && !editOrder.vehicle.vin) {
      Alert.alert('Datos incompletos', 'Se requiere al menos las Placas o el VIN del vehículo.');
      return;
    }

    const photosCompleted = editOrder.photos.filter((p) => p.uri).length;
    if (photosCompleted < 6) {
      Alert.alert(
        'Fotos pendientes',
        `Faltan ${6 - photosCompleted} foto(s) de inspección. ¿Desea guardar de todos modos?`,
        [
          { text: 'Completar fotos', style: 'cancel' },
          {
            text: 'Guardar así',
            onPress: async () => {
              await saveCurrentOrder(editOrder);
              setIsCreating(false);
              setEditOrder(null);
              Alert.alert('Guardado', `Orden ${editOrder.id} guardada correctamente.`);
            },
          },
        ]
      );
      return;
    }

    await saveCurrentOrder(editOrder);
    setIsCreating(false);
    setEditOrder(null);
    Alert.alert('Guardado', `Orden ${editOrder.id} guardada correctamente.`);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditOrder(null);
    setCurrentOrder(null);
  };

  const handleSelectOrder = (order: WorkOrder) => {
    setViewingOrder(order);
    setIsViewing(true);
  };

  const handleEditFromView = () => {
    if (!viewingOrder) return;
    setEditOrder({ ...viewingOrder });
    setCurrentOrder(viewingOrder);
    setIsCreating(true);
  };

  const handleEditFromCard = (order: WorkOrder) => {
    setEditOrder({ ...order });
    setCurrentOrder(order);
    setIsCreating(true);
  };

  // ========================
  // ORDER VIEW (read-only)
  // ========================
  if (isViewing && viewingOrder) {
    return (
      <OrderView
        order={viewingOrder}
        onClose={() => {
          setIsViewing(false);
          setViewingOrder(null);
        }}
        onEdit={handleEditFromView}
      />
    );
  }

  // ========================
  // ORDER FORM VIEW
  // ========================
  if (isCreating && editOrder) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.otLabel}>Orden de Trabajo</Text>
              <Text style={styles.otId}>#{editOrder.id}</Text>
            </View>
            <ActionButton
              title={currentOrder ? "Ir atrás" : "Cancelar"}
              onPress={handleCancel}
              variant="secondary"
            />
          </View>

          {/* Client Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person" size={20} color={COLORS.accent} /> Datos del Cliente
            </Text>
            <FormField
              label="Nombre del Cliente"
              value={editOrder.clientName}
              onChangeText={(text) => setEditOrder({ ...editOrder, clientName: text })}
              placeholder="Nombre completo"
            />
            <FormField
              label="Teléfono"
              value={editOrder.clientPhone}
              onChangeText={(text) => setEditOrder({ ...editOrder, clientPhone: text })}
              placeholder="10 dígitos"
              keyboardType="phone-pad"
            />
          </View>

          {/* Vehicle Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="car" size={20} color={COLORS.accent} /> Ficha del Vehículo
            </Text>
            <FormField
              label="Placas"
              required
              value={editOrder.vehicle.plates}
              onChangeText={(v) => handleVehicleChange('plates', v)}
              placeholder="ABC-123"
              autoCapitalize="characters"
            />
            <FormField
              label="VIN"
              value={editOrder.vehicle.vin}
              onChangeText={(v) => handleVehicleChange('vin', v)}
              placeholder="Número de identificación vehicular"
              autoCapitalize="characters"
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormField
                  label="Marca"
                  value={editOrder.vehicle.brand}
                  onChangeText={(v) => handleVehicleChange('brand', v)}
                  placeholder="Ej: Toyota"
                />
              </View>
              <View style={styles.halfField}>
                <FormField
                  label="Modelo"
                  value={editOrder.vehicle.model}
                  onChangeText={(v) => handleVehicleChange('model', v)}
                  placeholder="Ej: Corolla"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormField
                  label="Año"
                  value={editOrder.vehicle.year}
                  onChangeText={(v) => handleVehicleChange('year', v)}
                  placeholder="2024"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <FormField
                  label="Color"
                  value={editOrder.vehicle.color}
                  onChangeText={(v) => handleVehicleChange('color', v)}
                  placeholder="Ej: Blanco"
                />
              </View>
            </View>
            <FormField
              label="Motor"
              value={editOrder.vehicle.engine}
              onChangeText={(v) => handleVehicleChange('engine', v)}
              placeholder="Ej: 1.8L 4 cilindros"
            />
            <FormField
              label="Odómetro (km)"
              value={editOrder.vehicle.odometer}
              onChangeText={(v) => handleVehicleChange('odometer', v)}
              placeholder="Ej: 45000"
              keyboardType="numeric"
            />
          </View>

          {/* Photo Inspection */}
          <View style={styles.section}>
            <PhotoGrid
              photos={editOrder.photos}
              onPhotosChange={handlePhotosChange}
              editable
            />
          </View>

          {/* Reason for Visit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="document-text" size={20} color={COLORS.accent} /> Motivo de Ingreso
            </Text>
            <FormField
              label="Descripción de la falla o servicio solicitado"
              value={editOrder.reasonForVisit}
              onChangeText={(text) => setEditOrder({ ...editOrder, reasonForVisit: text })}
              placeholder="Describa el motivo del ingreso del vehículo..."
              multiline
              numberOfLines={4}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>

          {/* Save Button */}
          <ActionButton
            title="Guardar Orden de Trabajo"
            onPress={handleSave}
            variant="success"
            icon={<Ionicons name="checkmark-circle" size={24} color={COLORS.white} />}
            style={styles.saveButton}
          />

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ========================
  // ORDER LIST VIEW
  // ========================
  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.screenTitle}>Recepción</Text>
        <ActionButton
          title="Nueva OT"
          onPress={handleNewOrder}
          variant="primary"
          icon={<Ionicons name="add-circle" size={24} color={COLORS.white} />}
        />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Sin órdenes de trabajo</Text>
            <Text style={styles.emptySubtitle}>
              Presione &quot;Nueva OT&quot; para iniciar una recepción
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => handleSelectOrder(order)}
              onEditPress={() => handleEditFromCard(order)}
            />
          ))
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  otLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  otId: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.white,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    marginTop: SPACING.md,
    minHeight: 70,
  },
  bottomSpacer: {
    height: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
