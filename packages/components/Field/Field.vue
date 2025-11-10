<script setup lang="ts">
import Container from "../Container";
import type { FieldProps } from "./types";

defineOptions({ name: "YField" });
defineProps<FieldProps>();
</script>

<template>
  <Container :vertical="vertical" position="relative">
    <slot name="label" />
    <slot />
    <div style="position: absolute; bottom: -100%">
      <slot name="error" />
    </div>
  </Container>
</template>
