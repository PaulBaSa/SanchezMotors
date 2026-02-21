// =============================================
// Tab 2: Task Tracking (Kanban Operation)
// - Kanban board: Pending, In Progress, Completed
// - Evidence log with photos and notes per task
// - Time tracking per mechanic
// =============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../../src/constants/theme';
import { ActionButton } from '../../src/components/ActionButton';
import { StatusBadge } from '../../src/components/StatusBadge';
import { useApp } from '../../src/storage/AppContext';
import { createEmptyTask } from '../../src/storage/orderStorage';
import { WorkOrder, WorkTask, TaskStatus, TaskPhoto } from '../../src/types';
import { formatHours } from '../../src/utils/formatters';
import { v4 as uuidv4 } from 'uuid';

type KanbanColumn = TaskStatus;

const COLUMNS: { key: KanbanColumn; label: string; color: string }[] = [
  { key: 'pending', label: 'Pendiente', color: COLORS.kanbanPending },
  { key: 'in_progress', label: 'En Proceso', color: COLORS.kanbanInProgress },
  { key: 'completed', label: 'Finalizado', color: COLORS.kanbanCompleted },
];

export default function TasksScreen() {
  const { orders, currentOrder, setCurrentOrder, saveCurrentOrder } = useApp();
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
  const [editingTask, setEditingTask] = useState(false);

  // If no order selected, show order picker
  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Seguimiento de Tareas</Text>
        </View>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={80} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Sin órdenes activas</Text>
              <Text style={styles.emptySubtitle}>
                Cree una orden en Recepción para comenzar
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.pickOrderLabel}>Seleccione una Orden de Trabajo:</Text>
              {orders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderPickerCard}
                  onPress={() => setCurrentOrder(order)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderPickerRow}>
                    <Text style={styles.orderPickerId}>OT #{order.id}</Text>
                    <StatusBadge status={order.status} />
                  </View>
                  <Text style={styles.orderPickerVehicle}>
                    {order.vehicle.brand} {order.vehicle.model} - {order.vehicle.plates}
                  </Text>
                  <Text style={styles.orderPickerTasks}>
                    {order.tasks.length} tarea(s)
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  const handleAddTask = () => {
    const newTask = createEmptyTask(currentOrder.id);
    setSelectedTask(newTask);
    setEditingTask(true);
  };

  const handleSaveTask = async (task: WorkTask) => {
    const updatedTasks = currentOrder.tasks.filter((t) => t.id !== task.id);
    updatedTasks.push({ ...task, updatedAt: new Date().toISOString() });

    const updatedOrder: WorkOrder = {
      ...currentOrder,
      tasks: updatedTasks,
      status: updatedTasks.some((t) => t.status === 'in_progress')
        ? 'in_progress'
        : updatedTasks.every((t) => t.status === 'completed') && updatedTasks.length > 0
        ? 'completed'
        : currentOrder.status,
      updatedAt: new Date().toISOString(),
    };

    await saveCurrentOrder(updatedOrder);
    setSelectedTask(null);
    setEditingTask(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert('Eliminar Tarea', '¿Está seguro de eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const updatedOrder: WorkOrder = {
            ...currentOrder,
            tasks: currentOrder.tasks.filter((t) => t.id !== taskId),
            updatedAt: new Date().toISOString(),
          };
          await saveCurrentOrder(updatedOrder);
          setSelectedTask(null);
          setEditingTask(false);
        },
      },
    ]);
  };

  const handleMoveTask = async (task: WorkTask, newStatus: TaskStatus) => {
    await handleSaveTask({ ...task, status: newStatus });
  };

  const getTasksForColumn = (status: TaskStatus) =>
    currentOrder.tasks.filter((t) => t.status === status);

  // ========================
  // TASK EDIT MODAL VIEW
  // ========================
  if (editingTask && selectedTask) {
    return (
      <TaskEditor
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={() => handleDeleteTask(selectedTask.id)}
        onCancel={() => {
          setEditingTask(false);
          setSelectedTask(null);
        }}
      />
    );
  }

  // ========================
  // KANBAN BOARD VIEW
  // ========================
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Tareas</Text>
          <Text style={styles.orderRef}>OT #{currentOrder.id}</Text>
        </View>
        <View style={styles.headerButtons}>
          <ActionButton
            title="+ Tarea"
            onPress={handleAddTask}
            variant="primary"
          />
          <TouchableOpacity
            onPress={() => setCurrentOrder(null)}
            style={styles.closeBtn}
          >
            <Ionicons name="close-circle" size={32} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal style={styles.kanbanScroll} showsHorizontalScrollIndicator={false}>
        {COLUMNS.map((col) => {
          const tasks = getTasksForColumn(col.key);
          return (
            <View key={col.key} style={[styles.column, { backgroundColor: col.color }]}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>{col.label}</Text>
                <View style={styles.columnCount}>
                  <Text style={styles.columnCountText}>{tasks.length}</Text>
                </View>
              </View>

              <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
                {tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => {
                      setSelectedTask(task);
                      setEditingTask(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.taskDescription} numberOfLines={2}>
                      {task.description || 'Sin descripción'}
                    </Text>
                    {task.mechanicName ? (
                      <View style={styles.taskMeta}>
                        <Ionicons name="person" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.taskMetaText}>{task.mechanicName}</Text>
                      </View>
                    ) : null}
                    <View style={styles.taskMeta}>
                      <Ionicons name="time" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.taskMetaText}>{formatHours(task.hoursWorked)}</Text>
                      {task.evidencePhotos.length > 0 && (
                        <>
                          <Ionicons name="camera" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.taskMetaText}>{task.evidencePhotos.length}</Text>
                        </>
                      )}
                    </View>

                    {/* Quick move buttons */}
                    <View style={styles.moveButtons}>
                      {col.key !== 'pending' && (
                        <TouchableOpacity
                          style={styles.moveBtn}
                          onPress={() => {
                            const prev = col.key === 'completed' ? 'in_progress' : 'pending';
                            handleMoveTask(task, prev);
                          }}
                        >
                          <Ionicons name="arrow-back" size={18} color={COLORS.accent} />
                        </TouchableOpacity>
                      )}
                      {col.key !== 'completed' && (
                        <TouchableOpacity
                          style={styles.moveBtn}
                          onPress={() => {
                            const next = col.key === 'pending' ? 'in_progress' : 'completed';
                            handleMoveTask(task, next);
                          }}
                        >
                          <Ionicons name="arrow-forward" size={18} color={COLORS.success} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ========================
// Task Editor Component
// ========================
function TaskEditor({
  task,
  onSave,
  onDelete,
  onCancel,
}: {
  task: WorkTask;
  onSave: (t: WorkTask) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [editTask, setEditTask] = useState<WorkTask>({ ...task });

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesita acceso a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const photo: TaskPhoto = {
        id: uuidv4(),
        uri: result.assets[0].uri,
        note: '',
        timestamp: new Date().toISOString(),
      };
      setEditTask({
        ...editTask,
        evidencePhotos: [...editTask.evidencePhotos, photo],
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.editorHeader}>
        <Text style={styles.editorTitle}>
          {task.description ? 'Editar Tarea' : 'Nueva Tarea'}
        </Text>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.editorSection}>
        <Text style={styles.fieldLabel}>Descripción del trabajo</Text>
        <TextInput
          style={styles.textArea}
          value={editTask.description}
          onChangeText={(text) => setEditTask({ ...editTask, description: text })}
          placeholder="Describa el trabajo a realizar..."
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.editorSection}>
        <Text style={styles.fieldLabel}>Mecánico asignado</Text>
        <TextInput
          style={styles.editorInput}
          value={editTask.mechanicName}
          onChangeText={(text) => setEditTask({ ...editTask, mechanicName: text })}
          placeholder="Nombre del mecánico"
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <View style={styles.editorSection}>
        <Text style={styles.fieldLabel}>Horas trabajadas</Text>
        <TextInput
          style={styles.editorInput}
          value={editTask.hoursWorked > 0 ? String(editTask.hoursWorked) : ''}
          onChangeText={(text) =>
            setEditTask({ ...editTask, hoursWorked: parseFloat(text) || 0 })
          }
          placeholder="0"
          placeholderTextColor={COLORS.textLight}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.editorSection}>
        <Text style={styles.fieldLabel}>Estatus</Text>
        <View style={styles.statusRow}>
          {COLUMNS.map((col) => (
            <TouchableOpacity
              key={col.key}
              style={[
                styles.statusBtn,
                {
                  backgroundColor: editTask.status === col.key ? col.color : COLORS.background,
                  borderColor: col.color,
                },
              ]}
              onPress={() => setEditTask({ ...editTask, status: col.key })}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  editTask.status === col.key && styles.statusBtnTextActive,
                ]}
              >
                {col.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.editorSection}>
        <Text style={styles.fieldLabel}>Notas</Text>
        <TextInput
          style={styles.textArea}
          value={editTask.notes}
          onChangeText={(text) => setEditTask({ ...editTask, notes: text })}
          placeholder="Notas adicionales sobre el trabajo..."
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Evidence Photos */}
      <View style={styles.editorSection}>
        <View style={styles.evidenceHeader}>
          <Text style={styles.fieldLabel}>Evidencia Fotográfica</Text>
          <ActionButton title="+ Foto" onPress={handleAddPhoto} variant="secondary" />
        </View>

        {editTask.evidencePhotos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {editTask.evidencePhotos.map((photo) => (
              <View key={photo.id} style={styles.evidencePhoto}>
                <Image source={{ uri: photo.uri }} style={styles.evidenceImg} />
                <TextInput
                  style={styles.photoNote}
                  value={photo.note}
                  onChangeText={(text) => {
                    const updated = editTask.evidencePhotos.map((p) =>
                      p.id === photo.id ? { ...p, note: text } : p
                    );
                    setEditTask({ ...editTask, evidencePhotos: updated });
                  }}
                  placeholder="Nota..."
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noPhotos}>Sin fotos de evidencia</Text>
        )}
      </View>

      <View style={styles.editorButtons}>
        <ActionButton
          title="Guardar Tarea"
          onPress={() => onSave(editTask)}
          variant="success"
          icon={<Ionicons name="checkmark" size={24} color={COLORS.white} />}
          style={styles.flex}
        />
        {task.description && (
          <ActionButton
            title="Eliminar"
            onPress={onDelete}
            variant="danger"
            icon={<Ionicons name="trash" size={24} color={COLORS.white} />}
          />
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
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
  closeBtn: {
    padding: SPACING.xs,
  },

  // Order picker
  pickOrderLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  orderPickerCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  orderPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orderPickerId: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orderPickerVehicle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  orderPickerTasks: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },

  // Kanban
  kanbanScroll: {
    flex: 1,
  },
  column: {
    width: 300,
    margin: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  columnTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  columnCount: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.round,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnCountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  taskMetaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  moveButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  moveBtn: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.round,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Task Editor
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  editorTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  editorSection: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  editorInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    minHeight: TOUCH_TARGET.minHeight,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    minHeight: TOUCH_TARGET.minHeight,
    justifyContent: 'center',
  },
  statusBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statusBtnTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  photoScroll: {
    marginTop: SPACING.sm,
  },
  evidencePhoto: {
    marginRight: SPACING.sm,
    width: 150,
  },
  evidenceImg: {
    width: 150,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: 'cover',
  },
  photoNote: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    color: COLORS.textPrimary,
  },
  noPhotos: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    padding: SPACING.md,
  },
  editorButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  bottomSpacer: {
    height: 60,
  },
});
