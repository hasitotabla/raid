<script lang="ts">
    import {
        type RaidHelper,
        raidHelpers,
        type RaidHelperResult,
        type RaidType,
        type AdditionalFields,
    } from "./Helper";

    let diskCount = $state<number | null>(null);
    let diskSize = $state<number | null>(null);
    let raidType = $state<RaidType | null>(null);
    let additionalFields = $state<AdditionalFields>({});

    const calculated = $derived.by<RaidHelperResult | null>(() => {
        if (diskCount == null || diskSize === null || raidType === null) {
            return null;
        }

        const fields = raidHelpers[raidType]?.additionalFields;
        if (fields) {
            for (const [field, label] of Object.entries(fields)) {
                if (additionalFields[field]) {
                    continue;
                }

                return {
                    success: false,
                    error: `Please fill out the ${label} field.`,
                };
            }
        }

        return raidHelpers[raidType].calculate(
            diskCount,
            diskSize,
            additionalFields,
        );
    });

    const selectedRaidHelper = $derived<RaidHelper | null>(
        raidType && raidHelpers[raidType] ? raidHelpers[raidType] : null,
    );
</script>

<main class="w-[90%] max-w-[1100px] m-auto">
    <h1 class="w-full py-[2em] text-primary-400 text-center">
        super cool raid calculator 🌴🥥
    </h1>
    <div class="w-full flex flex-col lg:flex-row">
        <div class="w-full flex flex-col justify-between items-center lg:w-1/2">
            <div class="w-full flex justify-between mb-3 items-center">
                <label for="diskCount">Number of Disks</label>
                <input
                    class="w-1/2"
                    type="number"
                    id="diskCount"
                    bind:value={diskCount}
                    min="1"
                    max="64"
                />
            </div>

            <div class="w-full flex justify-between mb-3 items-center">
                <label for="diskSize">Disk Size (TB)</label>
                <input
                    class="w-1/2"
                    type="number"
                    id="diskSize"
                    bind:value={diskSize}
                    min="1"
                    max="50"
                />
            </div>

            <div class="w-full flex justify-between mb-3 items-center">
                <label for="raidType">RAID Type</label>
                <select id="raidType" bind:value={raidType}>
                    <option value={null}>Select RAID Type</option>
                    {#each Object.entries(raidHelpers) as [type, { label }]}
                        <option value={parseInt(type)}>{label}</option>
                    {/each}
                </select>
            </div>

            {#if selectedRaidHelper?.additionalFields}
                {#each Object.entries(selectedRaidHelper.additionalFields) as [field, label]}
                    <div class="w-full flex justify-between mb-3 items-center">
                        <label for={field}>{label}</label>
                        <input
                            class="w-1/2"
                            type="number"
                            id={field}
                            bind:value={additionalFields[field]}
                            min="0"
                        />
                    </div>
                {/each}
            {/if}
        </div>

        <div class="w-full px-3 lg:w-1/2">
            {#if calculated === null}
                <p>Please fill out the form.</p>
            {:else if !calculated.success}
                <p>{calculated.error}</p>
            {:else}
                <p>
                    Total capacity: <span class="text-primary-400">
                        {calculated.data.capacity} TB
                    </span>
                </p>
                <p>
                    Speed gain: <span class="text-primary-400">
                        {calculated.data.speed}
                    </span>
                </p>
                <p>
                    Fault tolerance: <span class="text-primary-400">
                        {calculated.data.faultTolerance}-drive failure
                    </span>
                </p>

                {#if calculated.data.extraDetails}
                    <p>{calculated.data.extraDetails}</p>
                {/if}
            {/if}
        </div>
    </div>
</main>

<style lang="scss">
    input,
    select {
        // width: 100%;
        padding: 0.5rem;

        border: 2px solid #222222;
        border-radius: 8pt;

        font-family: "Inter", sans-serif;

        color: #ddd;
        background: #111;

        &:active,
        &:focus {
            outline: none;
            border-color: #666666;
        }

        &[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
        }
    }
</style>
