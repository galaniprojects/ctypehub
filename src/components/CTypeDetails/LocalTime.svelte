<script>
  export let datetime;
  const local = new Date(datetime).toLocaleString();
</script>

<time {datetime} {...$$restProps}>{local}</time>
