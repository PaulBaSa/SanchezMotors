// =============================================
// Tab 3: Budget & Finance
// - Quote generator: parts + labor per task
// - Privacy layer: Client view vs Admin view (PIN)
// - Balance formula: Sale - RealCost = Margin
// - WhatsApp share + PDF export
// =============================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../../src/constants/theme';
import { ActionButton } from '../../src/components/ActionButton';
import { StatusBadge } from '../../src/components/StatusBadge';
import { PinModal } from '../../src/components/PinModal';
import { useApp } from '../../src/storage/AppContext';
import { WorkOrder, WorkTask, BudgetSummary } from '../../src/types';
import { formatCurrency, calculateMargin } from '../../src/utils/formatters';
import { loginAsAdmin } from '../../src/storage/authStorage';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { orders, currentOrder, setCurrentOrder, saveCurrentOrder, isAdmin, login, logout } =
    useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingCosts, setEditingCosts] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{
    saleCost: string;
    laborSaleCost: string;
    realCost: string;
    laborRealCost: string;
  } | null>(null);

  // Sanitize numeric input: only digits and a single decimal point
  const sanitizeAmount = (text: string): string => {
    // Remove everything except digits and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Keep only the first decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  // Calculate budget summary — must be before any conditional returns (React Rules of Hooks)
  const summary: BudgetSummary = useMemo(() => {
    if (!currentOrder) {
      return { totalSale: 0, totalRealCost: 0, margin: 0, marginPercentage: 0 };
    }
    const totalSale = currentOrder.tasks.reduce(
      (sum, t) => sum + t.saleCost + t.laborSaleCost,
      0
    );
    const totalRealCost = currentOrder.tasks.reduce(
      (sum, t) => sum + t.realCost + t.laborRealCost,
      0
    );
    return {
      totalSale,
      totalRealCost,
      margin: totalSale - totalRealCost,
      marginPercentage: calculateMargin(totalSale, totalRealCost),
    };
  }, [currentOrder]);

  // Handlers must be before any conditional returns (React Rules of Hooks)
  const handleUpdateTaskCosts = useCallback(async (task: WorkTask) => {
    if (!currentOrder) return;
    const updatedTasks = currentOrder.tasks.map((t) =>
      t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t
    );
    const updatedOrder: WorkOrder = {
      ...currentOrder,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    };
    await saveCurrentOrder(updatedOrder);
  }, [currentOrder, saveCurrentOrder]);

  const handleSaveEditingCosts = useCallback(async () => {
    if (!editingValues || !editingCosts || !currentOrder) return;
    const task = currentOrder.tasks.find((t) => t.id === editingCosts);
    if (!task) return;
    Keyboard.dismiss();
    const updated: WorkTask = {
      ...task,
      saleCost: parseFloat(editingValues.saleCost) || 0,
      laborSaleCost: parseFloat(editingValues.laborSaleCost) || 0,
      realCost: parseFloat(editingValues.realCost) || 0,
      laborRealCost: parseFloat(editingValues.laborRealCost) || 0,
    };
    await handleUpdateTaskCosts(updated);
    setEditingCosts(null);
    setEditingValues(null);
  }, [editingValues, editingCosts, currentOrder, handleUpdateTaskCosts]);

  const handleCancelEditing = useCallback(() => {
    Keyboard.dismiss();
    setEditingCosts(null);
    setEditingValues(null);
  }, []);

  // If no order selected, show order picker
  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: SPACING.md + insets.top }]}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.screenTitle}>Presupuesto</Text>
          </View>
          {isAdmin ? (
            <ActionButton title="Salir Admin" onPress={logout} variant="danger" compact />
          ) : (
            <ActionButton
              title="Admin"
              onPress={() => setShowPinModal(true)}
              variant="secondary"
              icon={<Ionicons name="lock-closed" size={16} color={COLORS.accent} />}
              compact
            />
          )}
        </View>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calculator-outline" size={80} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Sin órdenes</Text>
              <Text style={styles.emptySubtitle}>
                Cree una orden en Recepción para generar presupuestos
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.pickLabel}>Seleccione una Orden:</Text>
              {orders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => setCurrentOrder(order)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderRow}>
                    <Text style={styles.orderId}>OT #{order.id}</Text>
                    <StatusBadge status={order.status} />
                  </View>
                  <Text style={styles.orderVehicle}>
                    {order.vehicle.brand} {order.vehicle.model} - {order.vehicle.plates}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
        <PinModal
          visible={showPinModal}
          onSubmit={async (pin) => {
            const success = await login('admin', pin);
            setShowPinModal(false);
            if (!success) {
              Alert.alert('Error', 'PIN incorrecto');
            }
          }}
          onCancel={() => setShowPinModal(false)}
        />
      </View>
    );
  }

  const generatePDFHtml = () => {
    const rows = currentOrder.tasks
      .map(
        (t) => `
      <tr>
        <td>${t.description}</td>
        <td style="text-align:right">${formatCurrency(t.saleCost)}</td>
        <td style="text-align:right">${formatCurrency(t.laborSaleCost)}</td>
        <td style="text-align:right">${formatCurrency(t.saleCost + t.laborSaleCost)}</td>
      </tr>`
      )
      .join('');

    return `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #2c3e50; }
          h1 { color: #1a1a2e; border-bottom: 3px solid #0f3460; padding-bottom: 10px; }
          .info { margin: 15px 0; }
          .info span { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1a1a2e; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .total { font-size: 1.3em; font-weight: bold; text-align: right; margin-top: 20px; color: #1a1a2e; }
          .footer { margin-top: 40px; font-size: 0.9em; color: #7f8c8d; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Presupuesto - Workshop Manager</h1>
        <div class="info">
          <p><span>Orden:</span> #${currentOrder.id}</p>
          <p><span>Cliente:</span> ${currentOrder.clientName || 'N/A'}</p>
          <p><span>Vehículo:</span> ${currentOrder.vehicle.brand} ${currentOrder.vehicle.model} ${currentOrder.vehicle.year}</p>
          <p><span>Placas:</span> ${currentOrder.vehicle.plates}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Refacciones</th>
              <th>Mano de Obra</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p class="total">Total: ${formatCurrency(summary.totalSale)}</p>
        <p class="footer">Documento generado por Workshop Manager</p>
      </body>
      </html>
    `;
  };

  const handleSharePDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generatePDFHtml(),
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Compartir no disponible', 'No se puede compartir en este dispositivo.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    }
  };

  const handleWhatsApp = () => {
    if (!currentOrder.clientPhone) {
      Alert.alert('Sin teléfono', 'Agregue el teléfono del cliente en la pestaña de Recepción.');
      return;
    }

    const message = encodeURIComponent(
      `*Presupuesto Workshop Manager*\n` +
        `Orden: #${currentOrder.id}\n` +
        `Vehículo: ${currentOrder.vehicle.brand} ${currentOrder.vehicle.model}\n` +
        `Placas: ${currentOrder.vehicle.plates}\n\n` +
        currentOrder.tasks
          .map(
            (t) =>
              `• ${t.description}: ${formatCurrency(t.saleCost + t.laborSaleCost)}`
          )
          .join('\n') +
        `\n\n*Total: ${formatCurrency(summary.totalSale)}*`
    );

    const phone = currentOrder.clientPhone.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=52${phone}&text=${message}`);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: SPACING.md + insets.top }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.screenTitle}>Presupuesto</Text>
            <Text style={styles.orderRef}>OT #{currentOrder.id}</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          {isAdmin ? (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          ) : (
            <ActionButton
              title="Admin"
              onPress={() => setShowPinModal(true)}
              variant="secondary"
              icon={<Ionicons name="lock-closed" size={16} color={COLORS.accent} />}
              compact
            />
          )}
          <TouchableOpacity onPress={() => setCurrentOrder(null)} style={styles.closeBtn}>
            <Ionicons name="close-circle" size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        {/* Task Line Items */}
        {currentOrder.tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Sin tareas para cotizar</Text>
            <Text style={styles.emptySubtitle}>
              Agregue tareas en la pestaña de Seguimiento
            </Text>
          </View>
        ) : (
          currentOrder.tasks.map((task) => (
            <View key={task.id} style={styles.lineItem}>
              <TouchableOpacity
                onPress={() => {
                  if (editingCosts === task.id) {
                    setEditingCosts(null);
                    setEditingValues(null);
                  } else {
                    setEditingCosts(task.id);
                    setEditingValues({
                      saleCost: task.saleCost > 0 ? String(task.saleCost) : '',
                      laborSaleCost: task.laborSaleCost > 0 ? String(task.laborSaleCost) : '',
                      realCost: task.realCost > 0 ? String(task.realCost) : '',
                      laborRealCost: task.laborRealCost > 0 ? String(task.laborRealCost) : '',
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.lineHeader}>
                  <Text style={styles.lineDescription}>{task.description || 'Sin descripción'}</Text>
                  <Ionicons
                    name={editingCosts === task.id ? 'checkmark-circle' : 'pencil'}
                    size={editingCosts === task.id ? 24 : 20}
                    color={editingCosts === task.id ? COLORS.accent : COLORS.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {/* Client visible prices */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Refacciones (venta)</Text>
                {editingCosts === task.id ? (
                  <TextInput
                    style={styles.priceInput}
                    value={editingValues?.saleCost ?? ''}
                    onChangeText={(text) =>
                      setEditingValues((prev) => prev ? { ...prev, saleCost: sanitizeAmount(text) } : null)
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textLight}
                    selectTextOnFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveEditingCosts}
                  />
                ) : (
                  <Text style={styles.priceValue}>{formatCurrency(task.saleCost)}</Text>
                )}
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Mano de obra (venta)</Text>
                {editingCosts === task.id ? (
                  <TextInput
                    style={styles.priceInput}
                    value={editingValues?.laborSaleCost ?? ''}
                    onChangeText={(text) =>
                      setEditingValues((prev) => prev ? { ...prev, laborSaleCost: sanitizeAmount(text) } : null)
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textLight}
                    selectTextOnFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveEditingCosts}
                  />
                ) : (
                  <Text style={styles.priceValue}>{formatCurrency(task.laborSaleCost)}</Text>
                )}
              </View>

              {/* Admin-only: Real costs */}
              {isAdmin && editingCosts === task.id && (
                <View style={styles.adminSection}>
                  <View style={styles.adminDivider}>
                    <Ionicons name="shield" size={14} color={COLORS.danger} />
                    <Text style={styles.adminDividerText}>Solo Admin</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, styles.adminLabel]}>Costo real refacciones</Text>
                    <TextInput
                      style={[styles.priceInput, styles.adminInput]}
                      value={editingValues?.realCost ?? ''}
                      onChangeText={(text) =>
                        setEditingValues((prev) => prev ? { ...prev, realCost: sanitizeAmount(text) } : null)
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textLight}
                      selectTextOnFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSaveEditingCosts}
                    />
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, styles.adminLabel]}>Costo real mano de obra</Text>
                    <TextInput
                      style={[styles.priceInput, styles.adminInput]}
                      value={editingValues?.laborRealCost ?? ''}
                      onChangeText={(text) =>
                        setEditingValues((prev) => prev ? { ...prev, laborRealCost: sanitizeAmount(text) } : null)
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textLight}
                      selectTextOnFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSaveEditingCosts}
                    />
                  </View>

                  {/* Per-task margin (reflects current editing values) */}
                  <View style={styles.taskMargin}>
                    <Text style={styles.taskMarginLabel}>Utilidad por tarea:</Text>
                    <Text
                      style={[
                        styles.taskMarginValue,
                        {
                          color:
                            (parseFloat(editingValues?.saleCost ?? '') || 0) +
                              (parseFloat(editingValues?.laborSaleCost ?? '') || 0) -
                              (parseFloat(editingValues?.realCost ?? '') || 0) -
                              (parseFloat(editingValues?.laborRealCost ?? '') || 0) >= 0
                              ? COLORS.profit
                              : COLORS.loss,
                        },
                      ]}
                    >
                      {formatCurrency(
                        (parseFloat(editingValues?.saleCost ?? '') || 0) +
                          (parseFloat(editingValues?.laborSaleCost ?? '') || 0) -
                          (parseFloat(editingValues?.realCost ?? '') || 0) -
                          (parseFloat(editingValues?.laborRealCost ?? '') || 0)
                      )}
                    </Text>
                  </View>
                </View>
              )}

              {/* Save / Cancel buttons shown while editing */}
              {editingCosts === task.id && (
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEditing} activeOpacity={0.8}>
                    <Ionicons name="close-circle-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveEditingCosts} activeOpacity={0.8}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.lineSubtotal}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>
                  {editingCosts === task.id
                    ? formatCurrency(
                        (parseFloat(editingValues?.saleCost ?? '') || 0) +
                        (parseFloat(editingValues?.laborSaleCost ?? '') || 0)
                      )
                    : formatCurrency(task.saleCost + task.laborSaleCost)}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Summary Card */}
        {currentOrder.tasks.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Venta:</Text>
              <Text style={styles.summaryTotal}>{formatCurrency(summary.totalSale)}</Text>
            </View>

            {/* Admin-only balance */}
            {isAdmin && (
              <>
                <View style={styles.adminDivider}>
                  <Ionicons name="shield" size={14} color={COLORS.danger} />
                  <Text style={styles.adminDividerText}>Balance Admin</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Costo Real Total:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(summary.totalRealCost)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Utilidad:</Text>
                  <Text
                    style={[
                      styles.summaryMargin,
                      { color: summary.margin >= 0 ? COLORS.profit : COLORS.loss },
                    ]}
                  >
                    {formatCurrency(summary.margin)} ({summary.marginPercentage.toFixed(1)}%)
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {currentOrder.tasks.length > 0 && (
          <View style={styles.actions}>
            <ActionButton
              title="Compartir PDF"
              onPress={handleSharePDF}
              variant="primary"
              icon={<Ionicons name="document-text" size={24} color={COLORS.white} />}
              style={styles.actionBtn}
            />
            <ActionButton
              title="WhatsApp"
              onPress={handleWhatsApp}
              variant="success"
              icon={<Ionicons name="logo-whatsapp" size={24} color={COLORS.white} />}
              style={styles.actionBtn}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <PinModal
        visible={showPinModal}
        onSubmit={async (pin) => {
          const success = await login('admin', pin);
          setShowPinModal(false);
          if (!success) {
            Alert.alert('Error', 'PIN incorrecto');
          }
        }}
        onCancel={() => setShowPinModal(false)}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  orderRef: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  adminBadgeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  closeBtn: {
    padding: SPACING.xs,
  },

  // Order picker
  pickLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orderId: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orderVehicle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },

  // Line items
  lineItem: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  lineDescription: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  priceLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  priceValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  priceInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    width: 120,
    textAlign: 'right',
    minHeight: 44,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    minHeight: TOUCH_TARGET.minHeight,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    minHeight: TOUCH_TARGET.minHeight,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  lineSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  subtotalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtotalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.accent,
  },

  // Admin section
  adminSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  adminDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.danger,
  },
  adminDividerText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.danger,
    textTransform: 'uppercase',
  },
  adminLabel: {
    color: COLORS.danger,
  },
  adminInput: {
    borderColor: COLORS.danger,
  },
  taskMargin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  taskMarginLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  taskMarginValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  summaryTotal: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.white,
  },
  summaryValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  summaryMargin: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
  },

  // Empty state
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
  bottomSpacer: {
    height: 60,
  },
});
