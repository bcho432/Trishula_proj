/** Trishula priority: construction + warehouse = high; retail + other = low. */
export function priorityForBuildingType(type) {
  if (type === 'Construction Site' || type === 'Warehouse') return 'high'
  return 'low'
}
