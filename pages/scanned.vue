<script setup lang="ts">
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper';

const sunrunPaper = useSunRunPaper();
const session = useSession();
const selectValue = ref('');
const runPreferences = useRunPreferences();
const data = await TotoroApiWrapper.getSunRunPaper({
  token: session.value.token,
  campusId: session.value.campusId,
  schoolId: session.value.schoolId,
  stuNumber: session.value.stuNumber,
});
watchEffect(() => {
  if (data) {
    sunrunPaper.value = data;
  }
});

const handleUpdate = (target: string) => {
  selectValue.value = target;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const defaultDistance = computed(() => {
  if (!data) return 3.2;
  const parsed = Number.parseFloat(String(data.mileage ?? ''));
  if (Number.isFinite(parsed)) return clamp(parsed, 3.2, 4.0);
  return 3.2;
});

const defaultDuration = computed(() => {
  if (!data) return 20;
  const minTime = Number.parseFloat(String(data.minTime ?? ''));
  const maxTime = Number.parseFloat(String(data.maxTime ?? ''));
  if (Number.isFinite(minTime) && Number.isFinite(maxTime)) {
    return clamp((minTime + maxTime) / 2, 15, 25);
  }
  if (Number.isFinite(minTime)) return clamp(minTime, 15, 25);
  if (Number.isFinite(maxTime)) return clamp(maxTime, 15, 25);
  return 20;
});

if (runPreferences.value.distanceKm === null) {
  runPreferences.value.distanceKm = defaultDistance.value;
}

if (runPreferences.value.durationMin === null) {
  runPreferences.value.durationMin = defaultDuration.value;
}

const distanceValue = ref(runPreferences.value.distanceKm ?? defaultDistance.value);
const durationValue = ref(runPreferences.value.durationMin ?? defaultDuration.value);

watch(distanceValue, (val) => {
  runPreferences.value.distanceKm = clamp(val, 3.2, 4.0);
});

watch(durationValue, (val) => {
  runPreferences.value.durationMin = clamp(val, 15, 25);
});

watch(
  () => runPreferences.value.distanceKm,
  (val) => {
    if (val !== null) {
      distanceValue.value = clamp(val, 3.2, 4.0);
    }
  },
);

watch(
  () => runPreferences.value.durationMin,
  (val) => {
    if (val !== null) {
      durationValue.value = clamp(val, 15, 25);
    }
  },
);

const distanceLabel = computed(() => `${distanceValue.value.toFixed(2)} km`);
const durationLabel = computed(() => `${durationValue.value.toFixed(1)} 分钟`);
</script>
<template>
  <p>请核对个人信息</p>
  <VTable density="compact" class="mb-6 mt-4">
    <tbody>
      <tr>
        <td>学校</td>
        <td>{{ session.campusName }}</td>
      </tr>
      <tr>
        <td>学院</td>
        <td>{{ session.collegeName }}</td>
      </tr>
      <tr>
        <td>学号</td>
        <td>{{ session.stuNumber }}</td>
      </tr>
      <tr>
        <td>姓名</td>
        <td>{{ session.stuName }}</td>
      </tr>
    </tbody>
  </VTable>
  <template v-if="data">
    <VSelect
      v-model="selectValue"
      :items="data.runPointList"
      item-title="pointName"
      item-value="pointId"
      variant="underlined"
      label="路线"
      class="mt-2"
    />
    <VDivider class="my-4" />
    <div class="flex flex-col gap-6">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-body-2">自定义路线长度</span>
          <span class="text-body-2 text-medium-emphasis">{{ distanceLabel }}</span>
        </div>
        <VSlider
          v-model="distanceValue"
          :min="3.2"
          :max="4.0"
          :step="0.1"
          thumb-label="always"
          color="primary"
        />
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-body-2">自定义预计耗时</span>
          <span class="text-body-2 text-medium-emphasis">{{ durationLabel }}</span>
        </div>
        <VSlider
          v-model="durationValue"
          :min="15"
          :max="25"
          :step="0.5"
          thumb-label="always"
          color="primary"
        />
      </div>
    </div>
    <div class="flex gap-4">
      <VBtn
        variant="outlined"
        color="primary"
        append-icon="i-mdi-gesture"
        @click="
          selectValue =
            data!.runPointList[Math.floor(Math.random() * data!.runPointList.length)].pointId
        "
      >
        随机路线
      </VBtn>
      <NuxtLink v-if="selectValue" :to="`/run/${encodeURIComponent(selectValue)}`">
        <VBtn class="ml-auto" color="primary" append-icon="i-mdi-arrow-right"> 开始跑步 </VBtn>
      </NuxtLink>
      <VBtn v-else class="ml-auto" color="primary" append-icon="i-mdi-arrow-right" disabled>
        开始跑步
      </VBtn>
    </div>
    <p class="mb-2 mt-6 text-xs">地图中的路线仅为展示路线生成效果，不等于最终路线</p>
    <div class="h-50vh w-50vw">
      <ClientOnly>
        <AMap :target="selectValue" @update:target="handleUpdate" />
      </ClientOnly>
    </div>
  </template>
</template>
