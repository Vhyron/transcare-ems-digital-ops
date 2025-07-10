'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteFormSubmission,
  updateFormSubmission,
} from '../../actions/form_submissions.action';
import {
  FormSubmission,
  FormType,
} from '../../db/schema/form_submissions.schema';
import { capitalizeString } from '../../utils';
import { useAuth } from '../provider/auth-provider';
import { Separator } from '../ui/separator';
import { hospitalTripTicketsPdf } from '../../utils/pdf';
interface Props {
  formSubmission: FormSubmission;
  formData: any;
}

const PendingFormAction = ({ formSubmission, formData }: Props) => {
  const { user } = useAuth();

  const handleUpdateStatus = async (
    status: 'approved' | 'rejected',
    formSubmission: FormSubmission
  ) => {
    const res = await updateFormSubmission(formSubmission.id, {
      status: status,
      reviewed_by: user?.id,
      updated_at: new Date(),
    });

    if (res?.error) {
      toast.error('Failed to approve form submission', {
        description: 'There was an error approving the form submission.',
        richColors: true,
      });
    }

    toast.success(
      `${capitalizeString(formSubmission.form_type, '_')} ${capitalizeString(
        status
      )}!`
    );
  };

  const handleDelete = async (formSubmission: FormSubmission) => {
    const res = deleteFormSubmission(formSubmission.id);

    if (!res) {
      toast.error('Failed to delete form submission', {
        description: 'There was an error deleting the form submission.',
        richColors: true,
      });
    }

    toast.success('Deleted form submission successfully!');
  };

  const generatePdf = async (form: FormType) => {
    switch (form) {
      case 'hospital_trip_tickets':
        hospitalTripTicketsPdf(
          formData,
          `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAtoAAAGOCAYAAACpGaRPAAAgAElEQVR4Xu3dCdx11fz38R4aVIgGDSq3SpMpotCgUDKkosiUIZG5SGZl/PMvQ2bpUciUiiQpqVslU0QlShQRormUMjzfD3s/ttM1nuvsc/bwWa/X73XOfV3nrL3We+/7vn9nnbXX+j9LWBRQQAEFFFBAAQUUUGDkAv9n5DVaoQIKKKCAAgoooIACCixhou1FoIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgoooIACCtQgYKJdA6pVKqCAAgoooIACCihgou01oIACCiiggAIKKKBADQIm2jWgWqUCCiiggAIKKKCAAibaXgMKKKCAAgooUAqskCd3S/w9sWrigYl1ExsllkksStyzwnVhnp+e+HFiceKvxe/+nMdrZVWg7wIm2n2/Auy/AgoooECfBJZMZ7dM3D2xU2LDxO0TayVuTaw4QoyrUxd5xtlF0n1UHgmLAr0RMNHuzam2owoooIACPRUgkd468fjEvkXyOymKc3LglyTOmlQDPK4C4xQw0R6ntsdSQAEFFFBgfAIb5FC7JJ6WuO8Qh7087/lF8T4ez02cl/hNEYyMUzZJ7Jjgz0vP8ThfzOtem/jlHF/vyxRopYCJditPm41WQAEFFFBgSoHN89OdEw9JPDix/DROF+TnJyauT3w/cVPxuovySII9bFk/b3xKglH0rRLrJdaeprLf5ed7Fe0Y9ni+T4FGC5hoN/r02DgFFFBAAQVmFWBaCEn18xMkuoPl9/nBJxMk1Mcl/jFrjaN9ASPeT0i8OrHcQNU35s/3StBGiwKdEzDR7twptUMKKKCAAh0XuEP6t01ii8QOiQdN0V+meXwhcXyC6R5NKHdJI96eeNFAY95Q/LwJbbQNCoxUwER7pJxWpoACCiigQG0CDy8Sa1YLYbm9wfLT/ODQBDccnlFbKxZeMf04OVHO5z6p6NfCa7YGBRomYKLdsBNicxRQQAEFFKgIrJnnrBaya+KRU8iwdN6pifcm/tAiuf3S1oOK9jLqztQSiwKdEzDR7twptUMKKKCAAh0Q2D994KZCNowZLEwLYUT42MR3WtrXw9PuZxdtf2Me39bSfthsBWYUMNH2AlFAAQUUUKAZAvdJM56b2C3BSHa1sNPiCYmjE19tRnOHbsVSeed1Ceaa31L09U9D1+YbFWiwgIl2g0+OTVNAAQUU6IXAY9LLdycG513fnJ99PMGa002ecz3fk8SGNR8o3nRKHrebbwW+XoG2CJhot+VM2U4FFFBAgS4JsMwdG7awmcw6Ax27MH8+MvH5xMVd6nTRF9bwLj9UPDvPWXrQokAnBUy0O3la7ZQCCiigQEMFlk27WE9678SqlTZ+L89PS3wmcX5D2z6KZrEk4ZlFRdfk8a6jqNQ6FGiqgIl2U8+M7VJAAQUU6JrAgenQAQOd+lL+/OkEj10vfMhg0xzmolNemPho1ztt//otYKLd7/Nv7xVQQAEF6hXgpsZXJVhBpBzBviLPP5hg7vXP6z18Y2q/Y1ryuQRLFVK+ndg2cWtjWmhDFKhBwES7BlSrVEABBRTovcDqEeCmv70SqxQal+aRXRBZNeTangkdk/4+sejz1Xm8f+KynhnY3R4KmGj38KTbZQUUUECB2gS4sZEpEc+qJNiMXB+cYNpEHwub6exTSbI3y/Mu3uTZx3Nrn2cRMNH2ElFAAQUUUGA0Ah9JNc9IME3i+gTrXrMRC1uj97W8KB3/UKXzm/f4A0dfr4Fe99tEu9en384roIACCixQ4G55P6PXrCSyUuKSBPOvv5Lo+6jt2jFgKb/lC+Nd8vjlBXr7dgVaJWCi3arTZWMVUEABBRoisCjt4MY+pkE8M3Fogpv9FjekfZNuxu3TAG54ZASbwtQZbgq1KNArARPtXp1uO6uAAgooMAKBp6eOwxO/TLwncWrxfARVd6YKXPYtesPo/u6JmzrTOzuiwBwFTLTnCOXLFFBAAQV6L3DfCDDveq3EIYnXJf7Se5XbArDbJRvvUBjVfmTirzop0EcBE+0+nnX7rIACCigwX4Gd84aPJZh3zZzsvs+/ns5vy/zijOKX7Py4aeJX88X29Qp0RcBEuytn0n4ooIACCtQhcLtUun/iLYlPJVhF45Y6DtSBOkmyT06wAyQj2LsmWDPcokBvBUy0e3vq7bgCCiigwCwCTHlgisi9E8zJfq5i0wo8NL85PbFk8QpG/flgYlGg1wIm2r0+/XZeAQUUUGAKgQ3ysz0SL03cKcH62IxkW6YWYPWV4yu/4gMJH0wsCvRewES795eAAAoooIACFYGt8/ykxDIJ/o9k2shBCk0rsFV+w0h2WbbJk2/ppYAC/xYw0fZKUEABBRRQYIklNgkCI9cPKTAuzyM3QP5AnGkFSKq/lmBO9u8SOyV+qJcCCvxHwETbq0EBBRRQoM8Ca6Tz3Oi4Z4Hwtzy+NfHuxI19hpml74/K749OrFAk29z46DrZXjAKDAiYaHtJKKCAAgr0UYCb9kio2Tq9/L+QjWdenPh5H0Hm0edX5rXvTGB4TOIZiZvn8X5fqkBvBEy0e3Oq7agCCiigQASWSjwx8Y7EOoXIZXk8IMEmKy7dN/1lsnp+9aHELsVL3pdHPqho5l8tBaYRMNH20lBAAQUU6IvAY9PR1yceVnT473l8VxHX9QVhyH4+OO/7XGLdBBvR7J34wpB1+TYFeiNgot2bU21HFVBAgd4K3C89/2CCFTLK8okiwb6otypz7zhJ9dsSKyX+nGDNbHfGnLufr+yxgIl2j0++XVdAAQU6LsCNeswnflXiDkVf2amQ9bEv7XjfR9G9B6aSzyZYV5zCTaMk3LeOonLrUKAPAibafTjL9lEBBRTol8DS6e7TEm9K3LPo+lfy+J6EazzPfi2wSQ92+yVuSFySYKfHc2Z/q69QQIGqgIm214MCCiigQJcE1ktnuEnvcUWnuNHxJQkSbcvMAuQErB3OaixsO89a4oxif0w4BRQYTsBEezg336WAAgoo0DwBEsLnF826Mo9Mc2BuNmtjW2YWYGrNBxLPK152ch75gPIL4RRQYHgBE+3h7XynAgoooEAzBNjNkaX5WH6OXQoPS7wh8cdmNK/RrVglrWNHR7aZv0th9trC02X7Gn3qbFwbBEy023CWbKMCCiigwFQCd80PWf/65cUvf5NHNk85Q645CexQfCi5e/Hq0/L4ssT5c3q3L1JAgVkFTLRnJfIFCiiggAINE2DTmX0S/1u064o8sh42NztaZhdgHfH3JjYrXnp9Hl+Y4FsBiwIKjFDARHuEmFalgAIKKFC7wCY5wpEJbtajsG06o7A/rf3I7T8AN4oypYYVRCh/SrDT49sTzmNv//m1Bw0UMNFu4EmxSQoooIACtxG4XX7yxiJun8erEvsmPp9wLvHMFwxz10mmn55g6cN/JD6cYEURkm2LAgrUJGCiXROs1SqggAIKjExgi9R0eOJeRY0s1cdGNO5OODMxU2xYhYUPKKtW7LjZ8YKRnR0rUkCBaQVMtL04FFBAAQWaKsBNetzoyM6OlN8mWH7upKY2uCHtWjLt2CVxYGLjok1n5fHdiWMb0kaboUAvBEy0e3Ga7aQCCijQOoHt02Juzlu5aDlrZJNwc+OeZXqBe+RXByd2LV7yszwyL9sE26tGgQkImGhPAN1DKqCAAgpMK8D2319IPKZ4xbV5ZG7xCZrNKvDsvILlDhcVr2QlFqaN3DrrO32BAgrUImCiXQurlSqggAIKDCGwXd7D7oQbFO/l+X4Jb3acGXPT/PrTiY2Kl7Eb5oEJdse0KKDABAVMtCeI76EVUEABBf4lwCj2OxMvKjwuLxLFj+szo8Dy+e1rEkwNuTHBHHY27DlbNwUUaIaAiXYzzoOtUEABBfoqMDga+7VAPDVxXV9B5tDvZYrkmtVDWOrw9wmW6vvoHN7rSxRQYIwCJtpjxPZQCiiggAL/X2DFPHt1gh0eWdv514ndE9/VaEaBtfLbwxLcLEr5XOJtCZfr88JRoIECJtoNPCk2SQEFFOi4wIbp3xGJzRNsnsJ24G9OuKLI9Cf+DvkVU0SYXnPXBGuIPylxbsevFbunQKsFTLRbffpsvAIKKNAqAUaumVNMUk1hXvGOidNa1YvxN3arHJKdHO+T4MZQdnk8NPGH8TfFIyqgwHwETLTno+VrFVBAAQWGFWAU+5AEUx7+mWAU+8CEo9jTi/LB5B0JdsGknJh4ceKSYU+C71NAgfEKmGiP19ujKaCAAn0UYBtw1ndeI/GTxFMSF/YRYh59ZsOZTyRYkYVl+nZOnDmP9/tSBRRogICJdgNOgk1QQAEFOiqwSfp1RGLtBPOKmfLwPwmmjFimFlg/P35/4tEJNpphRBuzvwqmgALtEzDRbt85s8UKKKBA0wXYBvygxG5FQ1nX+XkJRrMtUwtws+MrEnwYoWC1Z+KHgimgQHsFTLTbe+5suQIKKNA0AVbEeGmC+diUPydelTiiaQ1tWHtY1vDABDti/i7Bmths1sNcdosCCrRYwES7xSfPpiuggAINEVgz7fhMYutKe07I870SbKZimVqAqTWsJvLQIqlmPex3J64VTAEFuiFgot2N82gvFFBAgUkIkGCTGO6UYLfCsjD9gTWfLVMLLJUfM9KP03mJnyX2TbD1vEUBBTokYKLdoZNpVxRQQIExCjw9x3pfYuXKMVl2jrnYp46xHW07FNNEWE1k2SLJZrm+M9rWCdurgAJzEzDRnpuTr1JAAQUU+LcA/2+8K8GIbFmuyZPXJ9ganA1VLLcV2Dg/OjyxWYK56/slvpK4WiwFFOiugIl2d8+tPVNAAQXqEGDTmZdVKv5anj8zcVUdB+tIneyGyRJ9LNf3zgQrsrhRT0dOrt1QYCYBE22vDwUUUECBuQjw/wU37u1deTHrPb98Lm/u6Wsem35zUyjliARzsi/uqYXdVqCXAibavTztdloBBRSYlwA3730u8aTKu47Kc3Z4tNxWYLX86LjEAxIXJfgGwHnrXikK9FDARLuHJ90uK6CAAvMQuGNey/SQrSrvIenmpse/zKOePrx0o3TyBQlG+W9IsAHNpxM396Hz9lEBBW4rYKLtVaGAAgooMJ0AuxWemNim8gL+zEi2c4z/g7J6nnIzKCuIkGBz0+OrEzd5aSmgQL8FTLT7ff7tvQIKKDCdwHL5xVmJ+1de8K08f3LiCtn+JbBkgl0cX5tgF8ePJt6TcB62F4gCCvxLwETbC0EBBRRQYFCAOdnHJHas/OKzec50EUdpl1jidnFgq3mS7DsnsDkw8QsvJQUUUKAqYKLt9aCAAgooMCjw1vygurOjOz3+W4gpInsm9k+wEyarrrD1/I+9hBRQQIGpBEy0vS4UUEABBaoCj8ofvlH5wYF5/uaeE62b/j8+8YzEpokPFcm2o/s9vzDsvgKzCZhozybk7xVQQIF+CZyW7m5TdJkVM/boV/f/q7ck2Gw0s1uC5QwZuT464RSRHl8Udl2B+QiYaM9Hy9cqoIAC3RbYIN37edHFC/N4n8Tfut3lKXvH+tf7FB8yrs3j+xLc6PiHHlrYZQUUWICAifYC8HyrAgoo0DEBtgbfr+gTm6x8oGP9m6k7d8kvt0+w8+W2ifMS3OTIlukWBRRQYCgBE+2h2HyTAgoo0EkBNqBZNnFZgtHs6zrZy//uFP1lYxlucGQFkV8mWK6PeerX9KD/dlEBBWoUMNGuEdeqFVBAgRYJsF72jxIsXcdINiPaXS6bpHP7Jso56N/L84MTX024k2OXz7x9U2CMAibaY8T2UAoooECDBZgywtQRyoMSP2xwWxfStCflzUwHWa+o5Pt5fFXi9IVU6nsVUECBqQRMtL0uFFBAAQUQ+G5i8wQ3QW7YQZK90qdDK/06Ns9Zpu/UDvbVLimgQEMETLQbciJshgIKKDBBAeYpMz+b8okEm7J0obD29XMSTyw6c3Ue2fHybYlfd6GD9kEBBZotYKLd7PNj6xRQQIFxCDw2BzmhOBBzllk/u61luTR8p8QbExsVnfhVkVyzBvb1be2Y7VZAgfYJmGi375zZYgUUUGDUAmzK8pqi0nXyeMmoDzCG+tbPMd6V2LlyrOPy/OOJ8kPEGJrhIRRQQIH/CJhoezUooIACCrDrIbsfUpZKtGWTmlXS1kckXpl4cNF+ludj1ZRPJZgqYlFAAQUmJmCiPTF6D6yAAgo0RuDEtGSHBOtmr9CYVk3fkG3yK+ZePyqxRuLGxMlFgs0W8hYFFFCgEQIm2o04DTZCAQUUmKjA8Tk6Nw5Slk+UN0ZOtFFTHPy5+dmLEpsWv2MJwi8mmB5yVdMaa3sUUEABE22vAQUUUECBQ0JQblCzWZ7/oEEkzBl/YaLcGv6KPD8z8bEEo9gWBRRQoLECJtqNPTU2TAEFFBibQHWNabYiLzeuGVsDpjjQw/IzbtLcuvgdG8t8LsHoO/OwLQoooEDjBUy0G3+KbKACCihQu8DdcoQ/Fke5KI8b1H7EqQ+wan68Y4LpIQ9InJG4PPHRxOIJtcnDKqCAAkMLmGgPTecbFVBAgU4JsEPitkWPds/jF8bYO5bke0OinHvNZjIHJhi9vnKM7fBQCiigwEgFTLRHymllCiigQGsFnpSWs6ELhdHt1RP/rLE3m6Ru5l5vn1hUHOcbeXxP4us1HteqFVBAgbEJmGiPjdoDKaCAAo0WWDKtuyyxWtFK5m0fNuIWMzVkl8STE+Xo+Q15/o4Eo9fnj/h4VqeAAgpMVMBEe6L8HlwBBRRolMCr05p3Fi26OY+sUT2KTV9IrFma79GV3p6S5yzLx2Y5FgUUUKCTAibanTytdkoBBRQYSuB2edevEvco3n1AHt8yVE1LLHHvvO8Jiacm7lvUwY2NRyYYKf/FkPX6NgUUUKA1AibarTlVNlQBBRQYiwCjz+WNkEzruF/ikjkeec28jikhjIyTaFOY7/3lxGcTp8+xHl+mgAIKdELARLsTp9FOKKCAAiMV+GZqe0RR4zl53DIx026Re+T3j0lsl1ipeB9zrkmwTyiS7ZE20MoUUECBNgiYaLfhLNlGBRRQYLwC98rhfpS4Y3FYpns8J/G3SjPWyvOXJljzmm3bKWyJ/tUEK4dcN94mezQFFFCgeQIm2s07J7ZIAQUUaIJAdQoJ7SF5fn3iFYmdEmzVTmHeNcn1+xM/bULDbYMCCijQFAET7aacCduhgAIKNE/gI2nS3lM0i5FrtkE/NvGlxC3Na7otUkABBSYvYKI9+XNgCxRQQIEmCjBthO3QP5hYsdJAdm1k/jark1gUUEABBWYQMNH28lBAAQUUqAo8LH/YLcENjiTY1yRYS5sl/1j+j8KfX5JgJRGLAgoooMA0AibaXhoKKKCAAvxfQHLNPOy7FxzMtz48waYy3NhY3cymFHtrnrxJPgUUUECBqQVMtL0yFFBAgf4KsCTf04tA4fcJVhg5JvG9KVgel5+x2Uy5TTsvYSnAPRNMKbEooIACClQETLS9HBRQQIF+Caya7rJqyCGJOxRd/1aRYHNz41WzcPD/Bsv6vS9R/h/CVBKS8O/0i9LeKqCAAjMLmGh7hSiggALdF2DHxk0SL0uwqQyFjWjYAfLoBCuIzLew1jZL+u1QvPHmPL4xcfB8K/L1CiigQFcFTLS7embtlwIK9F2AGxfvm9gvwRQRdmwkoT4x8ZXEKYl/LhDpLnn/uxLPr9SzOM9J6M9bYN2+XQEFFGi9gIl260+hHVBAAQX+S+CFRVL9yDxuk/h54rgiGMVm5HnU5VGp8NOJcu42O0g+O/GZUR/I+hRQQIE2CZhot+ls2VYFFFDgtgKMWm9QJNW7F0k2NzRemCCxPmFMaMvmOCz3t3PleOfnOcsAMgfcooACCvROwES7d6fcDiugQAcE7pQ+7J94aIKRa8qfEj9JHJA4a4J9fF3RhqUrbTijaO93J9guD62AAgqMXcBEe+zkHlABBRQYSmDTvIu51uzKuG1Rw015LOdcc2NjHdNChmnsorzpiMTDB958bv7M2tu0+cZhKvY9CiigQJsETLTbdLZsqwIK9E1g13T48YnHJlapdH5xnn85wbzo2Zbjm6QZu0x+NMH0lmq5qEi4WU7wL5NsoMdWQAEF6hQw0a5T17oVUECB+Qs8OW/ZJcF868HklJFg1r++ZP7VTvQdW+Xo7CDJTZPVwo2a3DB5VILk26KAAgp0SsBEu1On084ooEALBR6UNq+dILkmlq/04YdFInp8Hi9uYd8Gm7xhfvCCxBMS61R+eUOen5ngpknmcf8m8asO9NcuKKBAzwVMtHt+Adh9BRSYiAArczAdhGkhqw+0gHnMn0qwkUxXtzVfruj7K/K4+QxngJs7GfU+PfHhiZwpD6qAAgosQMBEewF4vlUBBRSYo8Cd87p9E9zIuPUU72FzF5bG+2JimF0a59iMRr7sfmnVHgk+fKw7SwvZ4p0lA1nFhPnpFgUUUKDRAibajT49Nk4BBVoqsCjt3qIIbgTccqAff8yfv55gjesfJC5taT9H2Wx2ssSMJQsxY4v3mUa7ry0S7tPyyC6XfBNgUUABBRolYKLdqNNhYxRQoMUCi9L2ZyUenHjcFP1gbeuvJkiuTQrndqL5P4oNb5jTPXgjZbWGf+QPLG+ILdvLXz+36n2VAgooUK+AiXa9vtaugALdFVgpXWOe9XMS90hUb+6j179NfChBgs0cY8vCBG6ft2+TYF73QxIrTlPdP/Nzlj48JsHygaw1blFAAQUmImCiPRF2D6qAAi0UYP4wo6pswsL0hkWVPlyT539IMI2BedbMI2anRkt9AhulajbueXNi5WkOwwY+JNtfShyXuLW+5lizAgoocFsBE22vCgUUUGBqgQ3yY5bbWyPByPXgjXrMsz67iE/msW1rW3fpvDPCzeY+fADiOfO9BwtJN1NLWIv8GwmWELQooIACtQqYaNfKa+UKKNASgbXSzu0T909skmCDlakK61pz4x3L713Qkr71rZl3Kc4hq7uw6Q8j31OVn+WH702UK5n0zcn+KqDAGARMtMeA7CEUUKAxAsukJYx6csMijyTWg3Ory8YyHYR1nM9JcKMdG6lY2ifANxPstsk0EzYHutNAF5jTzZSf7yUOT/yifV20xQoo0FQBE+2mnhnbpYACCxFYL29eM8G0D0Y0WTaO3Re5aXHJKSq+Mj/7ZoJRzgsTJNdslGLpngBTS8p59pvleXXDIK6DqxOXJbiRlfW6r+gegT1SQIFxCZhoj0va4yigQB0Ci1IpI9KsU01STeK0avF88HgkUX9JMGL57QSj1T9NcNMiv7P0U4BEe68EI96s3X33AQa+2fhx4tQEW8STfDMKblFAAQVmFTDRnpXIFyigwAQEls4xGXkkMSaJXiHBz5hLfe/Exok7zNIubnZjaT3mVXPTInNx/zqBvnjIdgksSnOfnXhggqlFfBNSLSTZfEi7PMGNlaw2szjx53Z109YqoMA4BEy0x6HsMboksGw6s1uCG65YUoyttRnpOj7hKNfMZ/oB+fX6ib8lSJSZK0viS0LDGsnYcgMb60+vlphqisfgEUjE2VmxHJlm6gfTPi7q0kVnXyYqwKWktLUAACAASURBVN9z5vM/LLFNgg+AUxU+yPHhjilHfMA7eaKt9uAKKNAIARPtRpwGG9FgAZI9NiRhTifJISNcUy0dxs50VyWWK4IusVEGo1xsVkISyZ9ZYowb8hiNpW7+DlJf+bhUnpOwV49B3az/y2uuS7CM3C0VM0bX2I767wleS9L6/QRJ6EIL85uXT9wxQYJMm0mCNy3ayJ9pM1MvWP6O6RtloQ+MRs/33xmmcuD0q6IidlHElvL7BHOoL06QkFsUGLcAHxBZoYZt4rnRkhtrB5d+LNvENcqo90kJlhTk769FAQV6JDDf/wB7RGNXeyjA1AS2ziaZXpRgXV6SzDYWEl/+ft81MZi4z6c/JO8k7qMsjGKzggePjAJSLi2C54wGVj9IjPLY1qVAHQLlkoL828H0pscnSMIHy4/yA+Z7l3O9XXu9jrNhnQo0SMBEu0Enw6aMXeBFOSIjtkxpYFWKLhVWTiDJXmi5IRUwml0trB/NhxJGrFmdoVqYtsHoelmq86KZK339Qhvk+xVokQCj3ox+E9xsybc/ZWF0e3GCvxeHJZjzbVFAgY4JmGh37ITanTkLsK4uayOPqjBlY3BKCT9jGgTzhXk+isJ85BsrFTHForq+M8eiHdNNq2BqB6P0gysrDLbt1/kBI+GsuMC0leoxR9EP61CgjwLM9WZlHKabMB2NJSgpfGDl79pRxd9nvtUZxdSvPhrbZwUaJWCi3ajTYWPGKDBdos2NTGytzeYVzKmmMDrMPGgSWEa/mWPN/GFWG6CQkLKqhcnoGE+gh1Kg5QIrpf2MeHMD8A4JkvCysAQlc7uZYsLcbr8JavnJtvn9FTDR7u+5t+dLLPHiAoEVK85McLOfRQEFFJiEwN1y0E0S+ycY9a7uYMkKJsckvpTgWzKLAgq0RMBEuyUnymYqoIACCvRKYJ/09rGJ7Sq9Zh73BxIHJbhR2aKAAg0XMNFu+AmyeQoooIACvRZgrf6dE3smmGZCYZnLTyQOSTjC3evLw843XcBEu+lnyPYpoIACCijw73tEdkq8NcHuqBSWC3xhgnXzLQoo0EABE+0GnhSbpIACCiigwAwCrygSbjbIopyQeGWCzZwsCijQIAET7QadDJuigAIKKKDAHAVIst+W2DfBykdsAMWSgY5uzxHQlykwDgET7XEoewwFFBiVwANTEXNWV06wSgw3hBE8Z71vdpQkWG/cokAfBLZKJ7+YWLXo7DvyeGDx96EP/bePCjRawES70afHxinQSwG2rl47sV7i0YkNE1NtZz0bzu/yAna1XCHBiB9rofN4SuLrCTbl+eVslfh7BVogwDVOcs1KJRR2Z31Ygl1cLQooMEEBE+0J4ntoBRT4lwBfgW9TJAmsqsCGQNMVdtBjs6DBwuYfqyTKUT1+f2WCn89USERYKu0zCUbELQq0QYA1ttldkmT6yMSlRaNZDvCzCRLvGxKvTXywDR2yjQp0VcBEu6tn1n4p0FyBLdM0dsIjSViUuOdAU7mhi103L0kw+szINPNOh92Smn/n+Hp9yeKR7edZLo3EvFq+kz98LcGmIGxiZFGgSQL8XWEO9vMS/B0qy//kyesqf+bv02GJRxQ/e3ce92tSR2yLAn0SMNHu09m2rwpMRmCLIkFgi2lG4aqjzqwBzFb3bDn9vsTiBCNx4yjb5CAvSTwmUa7ewHGZXnJ64tsJEvxTE26BPY4z4jGqAuwSeZ8EH0iZQrVO5ZdX5PnZxd+Z8/PIutrVwlKAn0o8PcH9C0wp+ZC8CigwfgET7fGbe0QFui5wj3TwcQkSWBKEpQY6/Nv8+ZzENxMfTkx6ygZfw2+eeEHiSYnBfxeZx83mIEwvYV63RYG6BDZOxc9KPDmxqHIQbvA9qfg789U8zuXeAr7BOTzxjAQfHvmg+726Gm69CigwtYCJtleGAgqMQoDpGE9LMIJ2/4EKGVFjhPiMxP9NMM+6qeW+aRjzXJ+Y2GyKRpLkvCbh1JKmnsH2tesBaTIf8HZLrF9pPh9ImcZ0XOJbCf4ezbcsmzecluCDJFOwHpRgWpZFAQXGJGCiPSZoD6NARwVIErjZiq+3BwvJ6MEJRuIGv9puA8fyaSQbg7Dz3uoDDWZKyccSjHRbFJiPAB/muEeBvzuPSpT3CvDNzlmJnyeY9sHzURRW3jkvsSjBN0nbJbhR2KKAAmMQMNEeA7KHUKBjAkwFYdR3/8Rggn15fnZs4guJMzvUb26efHXiIQN9YvrLUxPMNbcoMJ0ANyhyEyP3KJBcl//3MteaG35ZB5tvS4YZtZ6L+o55ESPjHJdVdvi7a1FAgTEImGiPAdlDKNAhge3Tl/9NDE4P4cbB1yf4irvLhX6TqDAqWBamwvC1/3znv3ID5l4JTJdOME3giMSwq6t02b1tfWOUmpsZ+WDGNCSel4URa26w5e8Mf1+Y0jGOsncOwg3HLJ+5a+KYcRzUYyjQdwET7b5fAfZfgbkJMAr3pgTL5FUL0ycOSfxsbtV05lXc5PnxxFpFj5j3ynQANsWZqvBvLaPi3JC2TWJRYnB5Qd7HCiyvSjCX/ebOaPWjI6yuQ2LNVKN1K11mrjUj1yS2TAdZyFKVC5X8fCp4SoLdVJkO5TcxCxX1/QrMImCi7SWigAIzCayWXzLPmpscy8IKCMxNJsn+cY/52AyHkcn7VQxIqJgGcG6CUWrmx3KjGzehzadw4yhf97PDn6WZAsyx5sMVH7pY33qwcA2U31Jc2pAusLTmRYk7F9fo4DdTDWmmzVCgOwIm2t05l/ZEgVEKsOU5I9isJFIW5o+y+cUHEuP6unuUfaqjLlZ1YB3j6hrHozrOp1PRHqOqzHpGIsC3EnwAYvnK6nrwZeXsNMoHU6aFkNA2seySRnEfBYWbLllO0KKAAjUJmGjXBGu1CrRUgBsd3554aeIOlT7wlfO+CZcGu+2JJdn+eoLt4+dbrs4bFhfWrDs+WLjZlB0rLZMRYNSaRJR51uU0ocGW/Co/ODnB6jpfnkwz531U1q9niguFTZvczGbehL5BgbkJmGjPzclXKdAHgUXp5A8TK1Y6+8k8Z/vmP/cBYIF9ZCUWRgvvlbh9gvm6f0xcnGCEk2km1yXY0Y8NRAYL00t4HVNOykICx9QEy/gE+HDDhjE7JRZNc1g2jPlK4oQEK8+0rbCZDfPFWQWFwpKDfDNjUUCBEQuYaI8Y1OoUaKkAWz1/I8Gc7BsTjMy9K8H6u5bxCTAX/sjK4f6R59w0edX4mtDLIzFizVx65lxXP2hWMfjA9LkES1d2YcOiRekHS3Cy2RTzybnRmQ+CFgUUGKGAifYIMa1KgZYKrJB287U3u8cxTYEtm/k63DJ+AUbC2dynuiIJN57uOf6mdP6IG6aHTJtgvvWiGXr7mfyOJR2nW1GmzVB8C8PIPNfdRxPldJI298m2K9AoARPtRp0OG6PARATY2fHFiQsTrKDBqiKWyQm8IYd+a+XwN+Q5o6zsHGhZmAArxbw8sU/iTtNUxbcHX0uwgczxia6va/629JE18CnYvH9hxL5bAQWqAibaXg8K9FuAjVdIJvjKmKW+2rhVetfOIEsCkuxxY2pZXpAnh3ato2PsDyPXT0hUNxoaPDxzrfnQ2ZYbGkfJxzKErKjCdbdRgmUqLQooMAIBE+0RIFqFAi0VYGfCSxP8O8DcYG68szRDYHBUmxvVuGHNMjcBbvZjvjXJ40zTbriZkakhzL3uc+EGXuZps9IQmyWxXbxFAQVGIGCiPQJEq1CgpQKsOsBKF29OsKSfpTkC90xTqvPkvSly7ueGewyYGrLpNG8hkWQFmHMSfdvRdCZFlvQsp41wc3QXbvic+1XjKxWoScBEuyZYq1Wg4QLlZjQ/SDuf2fC29rV5JIKbVDr/qDxv41Jy4zp/WL03sc0UB/xRfsZNpa4XPf3ZYDSb5T03TrhZ0riuWo/TeQET7c6fYjuowG0E9i4SEn7BfOC/a9RIgdelVdVvGnjOlBLLfwuwUgbL8/FBpFrYvp6EkdU0HJ2d21XD5jxHJNgFlmX/nKs9NzdfpcC0AibaXhwK9EuAzU9YB5gl/dZNuIxfc88/c7KZN1uW7+UJm+D0vXDtstHKcxJPmwKDG3qZAsF1fknfsebZ/+XzelYfIsl+beKd83y/L1dAgQEBE20vCQX6I7BFuvqtBGvmMh+TFRYszRZgDjHrPVNuSrAN+JXNbnItrdsgtbJiCBYk2NzIO1jYhfM9CUaw3Xhl+NOwf97KZlW/TnCTpMtKDm/pOxX412oDFgUU6L4AOz6y9TcjVYxSMVplab5A+VV+2VKSzCOa3+wFt3CZ1MAGSlsnHpnYZoYaT8/v3pJw/vqC2f9Vwd0SfGih4M6Hc4sCCgwpYKI9JJxvU6BFAmzSsTjBSgKnJR7Rorb3val8MGJ6z9IFBMvRPb6jKIxSs94137asOUsfua/gmAQ39TLVwTJaAa4zdo08NsHW9BYFFBhSwER7SDjfpkBLBNhR8LzEGgluCGP6CDeJWdoj8I00tbzRj2X++OB0TXuaP2NL189vX51YL/HQRHWTnqneyKoYeHwgcXlHDJrYDdbV50ZSPtCs7L8ZTTxFtqktAibabTlTtlOB+QswCvqVBDdAkpg9MOHNYfN3nPQ7XpYGHFJpxK55zmhumwtTQphPzTU52/9DbIF+UuKUxIfb3OkWtZ0P6BckVk08NfH5FrXdpirQKIHZ/oFrVGNtjAIKzEuAVReenGCpLnbJcw7rvPga82KmUVxWac1heb5XY1o3v4aw1vXBCeZdz1S48fPEBFuDs3PjP+d3GF89AgE+zLFs4scTzx9BfVahQC8FTLR7edrtdMcF+Hv9vgQjoZTdEkd3vM9d7x5TJhj9pfwpwVQgPkC1pWyWhr4+8YQZGnx9fvflBAne1xN/bUvnOtpOkmzOBd+CrdPRPtotBWoXMNGundgDKDB2ATbwKL9if3mel9sqj70hHnBkAm9MTaysURbm2p81strrq2iVVP3mBNfkdIWbGdmc5/iES8nVdy7mWzM3T3N/B4WpJFfPtwJfr4ACs8+N00gBBdolwBQRRqFYweEjiRe1q/m2dhoBplywJXtZDsoT1jtucuGblHckuNFxsNyYH3BTI1umszyfpXkC90yTyg2t2Dzp/OY10RYp0HwBR7Sbf45soQJzFWA6wY8TjCIyt3X3xC1zfbOva7zAH9JCbk6jcJ4f0OAWc7PjqQk2R6oWEuwjE8zTvrjB7bdp/14OtBzRvneec3OkRQEF5ilgoj1PMF+uQEMFWGHk24kHJbhxjqkF1RvoGtpsmzUPAXY8fEHl9evmeTniOI9qan/pHYukjF0sq4Wk7YgEq41Ymi/AjdTcUM2NqHdK8CHJooAC8xQw0Z4nmC9XoKECrEXMjo/Mcd02QdJt6ZYAUzGOqnSJlUdYgaRphQ95Z1YaRaJG0uYNuU07UzO356359RsSv0nco11Nt7UKNEfARLs558KWKDCsAF/rfj/BvGzmvL5i2Ip8X6MFVkjrrkiUu0R+Ls+f1sAWlyOhNI2VRJjuwnJ9lnYJLE5zH55g/fLt2tV0W6tAcwRMtJtzLmyJAsMIkFwzesh8XebEzrY+8TDH8D3NESDpKc/xn/Oc+fhNKyT/rH1NYTdS5vpa2iWwTJp7c9Fkvil7bbuab2sVaI6AiXZzzoUtUWAYgXfnTYxgM3LI/OyLhqnE97RG4CVpKduPl4W1taurkTShI3ukEZ8sGnJGHrkx0tIugfsX1xU5AvcFHNqu5ttaBZojYKLdnHNhSxSYrwBLbp2dYCrB/yaYp23ptsDa6d6vK10k8f5Qw7pc3i9As9g4ad+Gtc/mzC7wlLyk3HadzYZ+MPtbfIUCCkwlYKLtdaFAOwVul2afnGAawbmJzRPlV73t7JGtnqsAH642LV7MToq7zPWNY3odo9hbFsfyA+CY0Ed8GO712Keokzn23BtgUUCBIQRMtIdA8y0KNEDgYWlDubLII/L8tAa0ySaMR+BlOcwhxaGuzSO79v1jPIee01F+nldtULzyMXlkO3VLuwT4EM8NkE29D6Bdmra21wIm2r0+/Xa+pQKsU/ytBPNzP5t4ekv7YbOHE7hX3ladi79NcT0MV9to38UGNX+rVLlanv9xtIewtjEI/CTHuF+Ctc95tCigwJACJtpDwvk2BSYo8MIc+8MJvs5lnrZf607wZEzo0ItzXJZeo7DL4qsm1I7Bw66cH/yp8sM75PlfG9I2mzF3Ab4puXPiq4kd5/42X6mAAoMCJtpeEwq0S2ClNPfyBHO0uenMXfbadf5G1VrmQDMXmnJp4p6jqniB9bCxCe2hXJO46wLr8+3jF1gjh/xdcVhutOWGW4sCCgwpYKI9JJxvU2BCAkfmuEwVuTKxXpHMTKgpHnbCAizrt0nRBpZj46bYSReWmCxXqGB7eLaJt7RLgJtrjy2a3MRVbdqlaWt7L2Ci3ftLQIAWCZC0sAMkN7+xdjYrA1j6K7B3uv6Rovt8s/HKBlDsmjZ8sWgHN+uWq480oGk2YY4C3Pfx1OK16+fxF3N8ny9TQIEpBEy0vSwUaI8AW27vnuBGuA0T/2xP021pDQLMf2bUePUEa2tvnPhLDceZT5UsCVd+AGQzpf3m82ZfO3GBjdKCC4pWnJ9H7gGxKKDAAgRMtBeA51sVGKPADjnWicXx2Hnv02M8todqrgA3QbJWNWX7xDcm3NTjcvwnFG3YP48HTbg9Hn7uAuQDrGa0VfGW3fJ49Nzf7isVUGAqARNtrwsF2iFwapq5bYKl0hhlqq7s0I4e2Mo6BFgZgm842FTkqAQ7+k2ysGb2o4sGsA7zKZNsjMeel0B5/wdvYooam2BZFFBggQIm2gsE9O0KjEGAG8z4j4+/r6w0Uo5gjuHQHqIFAuV0jb+nraxKw9JskypscEIbKKyEcumkGuJx5yXA6DUf1ChsfsRa7UxLsiigwAIFTLQXCOjbFRiDwAdzjBcnmH+7ZuLqMRzTQ7RHYLk0lZU+mKPNDZGTWvKRdtxYYWO0/fr2MPa2pVw3303cqRDgW5Ey6e4tih1XYFQCJtqjkrQeBeoRYBdIlvJbOsHNkE+r5zDW2nKBZ6X9rHnM+sfl9ufj7hJTmsolBt26e9z6wx2Pdc7ZBXKt4u0sHcqqIxYFFBiRgIn2iCCtRoGaBKpf6T4xx/hSTcex2nYLsIERy7Ctk2Dn0I9OoDvPzDE/VRz3rDxuMYE2eMj5CZyclzOXnvKJxJ7ze7uvVkCB2QRMtGcT8vcKTFaAhOkFCeZNMvp03WSb49EbLPCYtO2EBP+usw4yX/9z3YyrfD4HKm/GfGuev2lcB/Y4Qwmw/CLr8VNY83znBN9EWBRQYIQCJtojxLQqBWoQYJSSHSB/mOCmSIsCMwmQaD+2eMFpeWSUktUk6i5MbeJD4DLFgR6aR+b9WpopcECadWDRNFYyYjOs6vz6ZrbaVinQQgET7RaeNJvcG4Fl09NyA5KP5/nze9NzOzqsAJvYHJZgrm1ZWD3i4ES5i+Swdc/0PlbDeWfxApYbnNQ88Tr61rU6t06HWC+7LH4o6toZtj+NEjDRbtTpsDEK/JcA21efUfyE7bY/po8CcxRgJYlDE9V50tws+fIEywCOsiyZyn6bYC1vynMTh4/yANY1MoHNUhNJNh/I2FmWaWl8iLcooEBNAibaNcFarQIjENgrdZAsUR6eOH0EdVpFfwRIplgasnqDG1OQuFmS5QBHVdigho1qKHwDs0rxOKr6rWc0AiwNynlfrajuHXl8/WiqthYFFJhOwETba0OB5gq8P017adE8RguvaG5TbVmDBUiEGbUsl3CjqazL/uERtbk6L5y5v28ZUb1WMzoB1sg+P7F2UeVX88jNj6P+dmN0LbYmBToiYKLdkRNpNzopcHx69fjEHxKrd7KHdmpcAtykyNztZ1QO+Ko8Z+UJphAMW3bKG79cvPmmPDI3+7JhK/N9tQjwDcNJiQcUtfPtA0uFcr4sCihQs4CJds3AVq/AAgR+nPfeP3FiolxJYgHV+VYF/rXSBKPOZTk6T5ine9UQNg8prs27FO99Qx7fPkQ9vqU+ATa8IrEu5+p/J8/5cPSn+g5pzQooUBUw0fZ6UKCZAmxffW3RNJIXkhiLAqMQYK1rpiXdraiMVUlY9/qIOVbO/xvcVPk/CeaBU85JPDjhVIQ5Io7hZUw341sxzgvlkgT3eviNwxjwPYQCpYCJtteCAs0UYDtrRrTZ8W/HBHMqLQqMSoA12Vl9YrlKhaxw897EqYnyQ97g8Ri9Zn3uTSq/IHFjNQumOFmaIfDANIMpPeW8/LPznA2N3JCmGefHVvRIwES7RyfbrrZK4HlpbbnsFknNT1rVehvbBgGSbG5c3Cdx+0qDGeH+bIKNbi6s/Pxpef6BxIqVn52S57snrmxDh3vSxmemn6yZvnzRX3aXfWWiXJO/Jwx2U4FmCJhoN+M82AoFBgUYWSQBojDP0l3bvEbqEtg+FR+YYOOSuZYb8kKmjrBEnKUZAkulGdzcWq5UdEuevy7xnsRCbnhtRu9shQItFTDRbumJs9mdF/h+esjcygsS9+58b+1gEwSYbrBL4jmJu8/QIKYksPOkI6RNOGv/bsMaCaYCrVc0icSabyA+35wm2hIF+ilgot3P826vmy3A1/i3Jvj7+enEHs1urq3roACr3ZB4sxwg1+M/EosTrGDBh0BLcwSelaYcnFi5aNJP8/jsBPOyLQooMGEBE+0JnwAPr8AUAiQ53AhJYTWIN6mkgAIKDAiwCQ0rEpVTRX6W52xExM2qFgUUaIiAiXZDToTNUKAiwM1Mnyr+zFJsR6mjgAIKVAT4MH5IguX6mCbCzav7Jlwf28tEgYYJmGg37ITYHAUi8MZEuY31pnn+I1UUUECBQuAleXx9YrXE5Qk+jJ+pjgIKNFPARLuZ58VW9VuAJdT4z5TCTU6/7zeHvVdAgQiwzOdnEosSLM14UOJtievUUUCB5gqYaDf33Niy/gp8MF1nriVlzcTv+kthzxXovcCyEWBnWJbqozAXmxVFyvs4eg8kgAJNFjDRbvLZsW19FeAGyHLL9Y2L/1j7amG/FeizAPdrHJ5g5Zc/Jrj5kW+8LAoo0BIBE+2WnCib2SuBvdNbdnaj7Jw4rle9t7MKKMAa+mw0s2VBwXrYbBB0rjQKKNAuARPtdp0vW9sPAVYSWFx0db88stubRQEFui3AFJGdEtwIfa+iq7/J48sSftju9rm3dx0WMNHu8Mm1a60VWDotvylxu8TRid1a2xMbroACswmsmhewIyfrYTNVjEKCzZSR9yWuma0Cf6+AAs0VMNFu7rmxZf0WOCPd52vjWxLL9JvC3ivQOYGV0iNGr/kQvUOldxfn+fsT3BDN+tgWBRRouYCJdstPoM3vrADLdrFWLmW7xCmd7akdU6D7Auuki49KPDrBfRd8W1UWEurjE3x79aXEDd3nsIcK9EfARLs/59qetktgizS33ITigDwvN7BpVy9srQL9Fbh3ur59gvWvn5i44wDFCfnzsYkvJ67qL5M9V6DbAiba3T6/9q7dAvzne9fE4sS27e6KrVegFwLcxLhHYvPEIxPlyPWNec5oNd9MfT3BUn0WBRTogYCJdg9Osl1srQA7v7HqCGWFhDvAtfZU2vAOCzBSvU+CrdBXTLCbK4X51iTWJydIsi0KKNBDARPtHp50u9waAb52PqloLTtFfrg1LbehCnRbgGkhWyXKOddlb7+dJ19L8CH51m4T2DsFFJiLgIn2XJR8jQKTEVgyh2WZr9UT5yc2TbAKiUUBBcYv8LAc8hFFlFO5WHrvJ4nFiUMTl4+/WR5RAQWaLGCi3eSzY9sUWGKJ1wSBHeEouyaOEUUBBcYmsFGOxPJ7rHPNCHZZzsmTLya+kPjV2FrjgRRQoHUCJtqtO2U2uGcCd0p/f53gpsjLEmxo4fJfPbsI7O7YBZ6UI74hwYohZbkoT1glhJHrS8beIg+ogAKtFDDRbuVps9E9E3he+vvxos8sBcbomkUBBUYn8JBUxcj1BondK9Xy4ZY519wfce7oDmdNCijQFwET7b6cafvZZoGl0vjvJ8rRtdfleTmdpM39su0KTFKAex6emWCN67UqDflxnjNF67jEeZNsoMdWQIH2C5hot/8c2oN+CDDS9o1KQvDcPD+8H123lwqMRICbGR+TYKUQbjBes1LrGXn+mQTL8F0xkqNZiQIKKBABE20vAwXaI/DANJV1eZmvTWHd3qPa03xbqsBYBe6foz08wUohbH++fOXoP83zryR4PC3haiFjPTUeTIH+CJho9+dc29NuCGyZbrABxrKJmxOM0C3uRtfshQJDC7A6CGtbr5vg7wgrhLDJU1mYAkJCfUGCnRm5wdiigAIK1C5gol07sQdQYOQCjGz/sKj1pjwyx5TkwaJAHwQYmV4twYZOfLuzduIFlY6zOsiPEmcXf09Yiu/aPsDYRwUUaJ6AiXbzzoktUmAuAswzLZPrv+X5jibbc2HzNS0TuHvaS2ye2CLBh8y7JJZJ3DnxqQQbxvwl8c3EL1rWP5urgAIdFzDR7vgJtnudFnhCesfKCBTW1mZU77Od7rGd67rAZukgS+1x4yJBUs1a8hRGpU9IcFMwc6vZKObKroPYPwUUaLeAiXa7z5+tV4BkhA00mJ9K+VnigCIhYZTPokBTBbZLw7hZ8Z4JRq15XhY+OH63Eiy597umdsR2KaCAAtMJmGh7bSjQfgHW2WYXu1cn+Eq9LIflyQcTfLVuUWBSAiyl97jEignmVd83cbdKYy7O828l2G3xO8X16kj1pM6Wx1VAgZEKmGiPlNPKFJiowPo5+k5FUlMdHWTeKnNZ35NwlHuip6jTB79XekdsnHhwgnWqNywS7LLjf8iT0xOsnMNUEEatf9tpFTungAK9FjDR7vXpt/MdFmC5M7Zqf1Zi5Uqyw1bu7CrJ6KFFhK5MmAAACW9JREFUgfkK3CNvYNWPdYok+qF5XFQ8X65SGavhsJspH/KY8sGINcvrWRRQQIFeCZho9+p029meCjCquGfilYny7zy74B2UcFpJTy+KGbpdfjBjhY+VEqxLzej0fRLcnFgt1+cPLKV3boK1qVl28peJy2RVQAEFFHBnSK8BBfokwFxuppa8JrFp0XFGG9ld8sgiYeqTR5/7ys2H/0ywwcvWCaYdsR41I9U8VgtTPX6f+FPiz4mzEiTSP+8zoH1XQAEF5iLgiPZclHyNAt0S4O89c2iZWrJ7YlHRPZZL+1ri1ASrPDi9pN3nnVFozvUaCRLoByUYkWY96lUTtxRBAs2mLkz3IJHmW46rE8yfZvdRiwIKKKDAkAIm2kPC+TYFOiTA6DYj3TskSMApJGHXJI5PsGQgN1GSfLF+MStCXN6h/re5KyTMbDfO6PI/Ei9PXJVg9ZlHFOeNjY3+Wvz8xjzyAYrkmtU+LAoooIACNQqYaNeIa9UKtFDgdmkzI6BsGrJKgjm6KyT2SNwxwQ1vzMsl6WYKAckdc3RZQYIknJ87pWA0J36tVMP0DjZsYSUPzg2ryWyS4NsHpv2wOyLTPlhRhiSarcn5RoKRaYsCCiigwIQFTLQnfAI8vAItEmDFCQpTELjBkmScn5GQk+CVhekGbDhC4seUBP6dYUScG+UYKefPSyZIzH+TIFknoSR4fmvx8xbRzNhUpnDQN+bIM9LM8wckSKD52d8SjErzO+xYyYMPNazu8ccEUzlYAo8PMCTQmP2gKzj2QwEFFOiygIl2l8+ufVNgfAJsRsI0BpYVXC/BSPjmxeH5WXWDktlaxVzh6xJl4k3CTuJOks60h4uKPzOyS+J5QfH6ZfO4dPE6buCjMApMkNCSwPNvHs+pi6Se1/Nzkl3+/PfifSS+/Ixj8yGBuvlAUZZt8uTC4r2sHb1tomwvx+CYvIdH5kVXl747u6iXujjmt4vjnpfHcqOWxZVj+VQBBRRQoKUCJtotPXE2W4EWC2w2kHiWXSE5J/FlKgT/NjGPmLnFxF0TJPAsPce0CaaqkGiz5BylTLJvn+cktowID1M4FnWTcDO6zLFYC5rEn1H77yVIvBnJZ2SZqTJl+/gQQOJMW/gAwHsovM6igAIKKNBDARPtHp50u6xATwQYTWYaBiPYMxWSY7b+ZmTbooACCiigwMgETLRHRmlFCiiggAIKKKCAAgr8R8BE26tBAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHARLsGVKtUQAEFFFBAAQUUUMBE22tAAQUUUEABBRRQQIEaBEy0a0C1SgUUUEABBRRQQAEFTLS9BhRQQAEFFFBAAQUUqEHg/wFxoiwHsjsa2gAAAABJRU5ErkJggg==`
        );
        break;
      case 'dispatch_forms':
        console.log('Generate Dispatch Form');
        break;
      case 'advance_directives':
        console.log('Generate Advance Directives');
        break;
      case 'refusal_forms':
        console.log('Generate Refusal Forms');
        break;
      case 'conduction_refusal_forms':
        console.log('Generate Conduction Refusal Forms');
        break;
      default:
        toast.error('Invalid form type', {
          description: 'The form type is not recognized.',
          richColors: true,
        });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => generatePdf(formSubmission.form_type)}>
          View Form Details
        </DropdownMenuItem>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Approve Form
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve this form?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this form? This action will
                mark the form as approved and notify the relevant parties.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleUpdateStatus('approved', formSubmission)}
              >
                Approve Form
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Reject Form
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this form?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this form? This action will mark
                the form as rejected and notify the relevant parties.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleUpdateStatus('rejected', formSubmission)}
              >
                Reject Form
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Separator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/80 active:bg-destructive/90"
                onClick={() => handleDelete(formSubmission)}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PendingFormAction;
