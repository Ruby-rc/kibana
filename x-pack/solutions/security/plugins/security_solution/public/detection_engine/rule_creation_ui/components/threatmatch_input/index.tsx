/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiFormRow } from '@elastic/eui';
import type { DataViewBase } from '@kbn/es-query';
import type { ThreatMapEntries } from '../../../../common/components/threat_match/types';
import { ThreatMatchComponent } from '../../../../common/components/threat_match';
import type { FieldHook } from '../../../../shared_imports';
import {
  Field,
  getUseField,
  UseField,
  getFieldValidityAndErrorMessage,
} from '../../../../shared_imports';
import type { DefineStepRule } from '../../../../detections/pages/detection_engine/rules/types';
import { schema } from '../step_define_rule/schema';
import { QueryBarField } from '../query_bar_field';
import * as i18n from '../step_define_rule/translations';
import { MyLabelButton } from '../step_define_rule';

const CommonUseField = getUseField({ component: Field });

interface ThreatMatchInputProps {
  threatMapping: FieldHook;
  threatIndexPatterns: DataViewBase;
  indexPatterns: DataViewBase;
  threatIndexPatternsLoading: boolean;
  threatIndexModified: boolean;
  handleResetThreatIndices: () => void;
  onValidityChange?: (isValid: boolean) => void;
}

const ThreatMatchInputComponent: React.FC<ThreatMatchInputProps> = ({
  threatIndexModified,
  handleResetThreatIndices,
  threatMapping,
  indexPatterns,
  threatIndexPatterns,
  threatIndexPatternsLoading,
  onValidityChange,
}: ThreatMatchInputProps) => {
  const { setValue, value: threatItems } = threatMapping;

  const { isInvalid: isThreatMappingInvalid, errorMessage } =
    getFieldValidityAndErrorMessage(threatMapping);
  const [isThreatIndexPatternValid, setIsThreatIndexPatternValid] = useState(false);

  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(!isThreatMappingInvalid && isThreatIndexPatternValid);
    }
  }, [isThreatIndexPatternValid, isThreatMappingInvalid, onValidityChange]);

  const handleBuilderOnChange = useCallback(
    ({ entryItems }: { entryItems: ThreatMapEntries[] }): void => {
      setValue(entryItems);
    },
    [setValue]
  );

  return (
    <>
      <EuiSpacer size="m" />
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={true}>
          <CommonUseField<string[], DefineStepRule>
            path="threatIndex"
            config={{
              ...schema.threatIndex,
              labelAppend: threatIndexModified ? (
                <MyLabelButton onClick={handleResetThreatIndices} iconType="refresh">
                  {i18n.RESET_DEFAULT_INDEX}
                </MyLabelButton>
              ) : null,
            }}
            componentProps={{
              idAria: 'detectionEngineStepDefineRuleThreatMatchIndices',
              'data-test-subj': 'detectionEngineStepDefineRuleThreatMatchIndices',
              euiFieldProps: {
                fullWidth: true,
                isDisabled: false,
                placeholder: '',
              },
            }}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <UseField
            path="threatQueryBar"
            config={{
              ...schema.threatQueryBar,
              labelAppend: null,
            }}
            component={QueryBarField}
            componentProps={{
              idAria: 'detectionEngineStepDefineThreatRuleQueryBar',
              indexPattern: threatIndexPatterns,
              isDisabled: false,
              isLoading: threatIndexPatternsLoading,
              dataTestSubj: 'detectionEngineStepDefineThreatRuleQueryBar',
              openTimelineSearch: false,
              onValidityChange: setIsThreatIndexPatternValid,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiFormRow
        label={threatMapping.label}
        labelAppend={threatMapping.labelAppend}
        helpText={threatMapping.helpText}
        error={errorMessage}
        isInvalid={isThreatMappingInvalid}
        fullWidth
      >
        <ThreatMatchComponent
          listItems={threatItems as ThreatMapEntries[]}
          indexPatterns={indexPatterns}
          threatIndexPatterns={threatIndexPatterns}
          data-test-subj="threatmatch-builder"
          id-aria="threatmatch-builder"
          onChange={handleBuilderOnChange}
        />
      </EuiFormRow>
      <EuiSpacer size="m" />
    </>
  );
};

export const ThreatMatchInput = React.memo(ThreatMatchInputComponent);
